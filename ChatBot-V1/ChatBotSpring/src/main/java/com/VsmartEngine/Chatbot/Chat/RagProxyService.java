package com.VsmartEngine.Chatbot.Chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.VsmartEngine.Chatbot.Departments.Department;
import com.VsmartEngine.Chatbot.Departments.DepartmentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * RagProxyService
 * ===============
 * Bridges visitor messages between Spring Boot and the Python RAG server.
 *
 * Session lifecycle:
 *   - First message → RAG answers     : session created with status=true (AI handled)
 *   - Later message → RAG has no answer: existing session status reset to FALSE (PENDING)
 *     so it appears in the agent's "Incoming" list, not "All".
 */
@Service
public class RagProxyService {

	@Value("${ragUrl}")
	private String ragUrl;

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private ChatSessionRepository sessionRepo;
    @Autowired private ChatMessageRepository messageRepo;
    @Autowired private DepartmentRepository  departmentRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RagProxyService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4_000);
        factory.setReadTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
    }

    public Map<String, Object> handleMessage(
            String sender,
            String message,
            Long   departmentId,
            String sessionId) {

        // ── Step 1: Call Python RAG ──────────────────────────────────────────
        Map<String, String> ragRequest = new HashMap<>();
        ragRequest.put("message",    message);
        ragRequest.put("session_id", sessionId != null
                ? sessionId : "anon_" + System.currentTimeMillis());

        boolean noContext = true;
        String  aiAnswer  = null;

        try {
            // ── CRITICAL FIX: Fetch as raw String, then parse with Jackson ──────
            // Previously used restTemplate.postForObject(..., Map.class) which caused
            // Jackson to fail silently on the "sources" array (complex ChromaDB objects),
            // returning a Map where "response" and "answer" keys were null even though
            // Python had correctly generated and returned the answer.
            // Solution: fetch the full JSON body as a String, then use JsonNode to
            // extract only the fields we care about — completely bypassing type issues.
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(ragRequest, headers);

            ResponseEntity<String> rawResponse = restTemplate.postForEntity(
                    ragUrl + "/chat", request, String.class);

            String rawBody = rawResponse.getBody();
            System.out.println("[RagProxy DEBUG] Raw JSON from Python: "
                    + (rawBody != null ? rawBody.substring(0, Math.min(300, rawBody.length())) : "null"));

            if (rawBody != null && !rawBody.isBlank()) {
                JsonNode root = objectMapper.readTree(rawBody);

                // Read no_context — default FALSE (trust the answer) when key absent
                JsonNode ncNode = root.get("no_context");
                if (ncNode == null || ncNode.isNull()) {
                    noContext = false;
                } else {
                    noContext = ncNode.booleanValue(); // correctly reads true/false JSON booleans
                }

                // Read answer — prefer "response", fall back to "answer"
                JsonNode respNode = root.get("response");
                if (respNode == null || respNode.isNull() || respNode.asText().isBlank()) {
                    respNode = root.get("answer");
                }
                aiAnswer = (respNode != null && !respNode.isNull())
                        ? respNode.asText().strip() : null;

                // Secondary safety check: short refusal phrases → treat as no answer
                if (!noContext && isNoContextAnswer(aiAnswer)) {
                    noContext = true;
                    aiAnswer  = null;
                }

                System.out.println("[RagProxy] no_context=" + noContext
                        + "  answerLen=" + (aiAnswer != null ? aiAnswer.length() : 0)
                        + "  answer=" + (aiAnswer != null ? aiAnswer.substring(0, Math.min(80, aiAnswer.length())) : "null"));
            }
        } catch (Exception e) {
            System.err.println("[RagProxy] RAG call failed (" + e.getClass().getSimpleName()
                    + "): " + e.getMessage());
            noContext = true;
            aiAnswer  = null;
        }

        Map<String, Object> result = new HashMap<>();

        // ── Step 2a: RAG answered — save messages and return AI answer ───────
        if (!noContext && aiAnswer != null && !aiAnswer.isBlank()) {

            ChatSession aiSession = null;
            if (sessionId != null) {
                aiSession = sessionRepo.findBySessionId(sessionId).orElse(null);
            }
            if (aiSession == null) {
                Department dept = resolveDept(departmentId);
                aiSession = new ChatSession();
                aiSession.setSessionId(UUID.randomUUID().toString());
                aiSession.setSender(sender);
                aiSession.setDepartment(dept);
                aiSession.setStatus(true);   // AI handled — not pending yet
                aiSession.setCreatedTime(LocalDateTime.now());
                sessionRepo.save(aiSession);
            }

            String sid = aiSession.getSessionId();
            saveMessage(sid, sender, message, "USER");
            saveMessage(sid, "AI_BOT", aiAnswer, "BOT");

            result.put("mode",      "AI");
            result.put("response",  aiAnswer);
            result.put("sessionId", sid);
            return result;
        }

        // ── Step 2b: RAG has no answer — escalate to live agent ──────────────
        ChatSession session = null;
        if (sessionId != null) {
            session = sessionRepo.findBySessionId(sessionId).orElse(null);
        }

        if (session == null) {
            // Brand-new session — visitor's first message is already unanswerable
            Department dept = resolveDept(departmentId);
            session = new ChatSession();
            session.setSessionId(UUID.randomUUID().toString());
            session.setSender(sender);
            session.setDepartment(dept);
            session.setStatus(false);   // PENDING — needs agent
            session.setCreatedTime(LocalDateTime.now());
            sessionRepo.save(session);
        } else {
            // ── FIX: Existing session was AI-handled (status=true).
            // Now RAG can't answer — reset to PENDING (status=false) so the
            // session moves back to the agent's "Incoming" list.
            if (session.isStatus() && session.getReceiver() == null) {
                session.setStatus(false);
                sessionRepo.save(session);
            }
        }

        // Save visitor message
        saveMessage(session.getSessionId(), sender, message, "USER");

        // Only save escalation system message once (check if already saved)
        boolean alreadyEscalated = messageRepo
                .findBySessionIdOrderByTimestampAsc(session.getSessionId())
                .stream()
                .anyMatch(m -> "SYSTEM".equals(m.getRole())
                        && m.getContent() != null
                        && m.getContent().contains("Escalated to live agent"));

        if (!alreadyEscalated) {
            saveMessage(session.getSessionId(), "SYSTEM",
                    "RAG could not answer this question. Escalated to live agent.", "SYSTEM");
        }

        // ── Step 3: Push WebSocket notifications to agents ───────────────────
        Long deptId = (session.getDepartment() != null)
                ? session.getDepartment().getId() : null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId",    session.getSessionId());
        payload.put("sender",       sender);
        payload.put("message",      message);
        payload.put("departmentId", deptId);
        payload.put("timestamp",    LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/admin/pending", payload);
        if (deptId != null) {
            messagingTemplate.convertAndSend("/topic/department/" + deptId, payload);
        }

        result.put("mode",      "PENDING");
        result.put("response",  "Connecting you to a live agent, please wait...");
        result.put("sessionId", session.getSessionId());
        return result;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void saveMessage(String sessionId, String sender, String content, String role) {
        ChatMessage msg = new ChatMessage();
        msg.setSessionId(sessionId);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setRole(role);
        msg.setTimestamp(LocalDateTime.now());
        messageRepo.save(msg);
    }

    private Department resolveDept(Long departmentId) {
        if (departmentId != null) {
            Department d = departmentRepo.findById(departmentId).orElse(null);
            if (d != null) return d;
        }
        return departmentRepo.findAll().stream().findFirst().orElse(null);
    }

    /**
     * Detect answers where the LLM is ONLY saying it has no answer.
     *
     * KEY FIX: We check whether the answer STARTS WITH one of the no-context
     * phrases (after normalization) rather than just contains them.
     * Previously, a valid long answer like "Meganar Technologies is ... I couldn't
     * find relevant information about X but ..." would falsely trigger this check
     * because "i couldn't find relevant information" appeared as a substring.
     * That caused the RAG answer to be discarded, noContext set to true, and the
     * widget to show "Sorry, I could not understand that." even though Python RAG
     * had generated a correct answer.
     *
     * Additionally, we require the answer to be SHORT (under 120 chars) before
     * treating it as a dead-end reply — real answers are always longer.
     */
    private boolean isNoContextAnswer(String answer) {
        if (answer == null || answer.isBlank()) return true;
        String normalized = answer.toLowerCase().replaceAll("\\s+", " ").strip();

        // If the answer is substantial (>120 chars), the LLM did answer — trust it.
        if (normalized.length() > 120) return false;

        String[] noContextPhrases = {
            "i do not have that information",
            "i don't have that information",
            "i do not know",
            "i don't know",
            "no relevant information",
            "unable to find",
            "not enough information",
            "i cannot answer",
            "i can't answer",
            "i am unable to answer",
            "i couldn't find relevant information",
            "i could not find relevant information",
            "sorry, the local model could not answer"
        };
        for (String phrase : noContextPhrases) {
            if (normalized.startsWith(phrase)) return true;
        }
        return false;
    }
}