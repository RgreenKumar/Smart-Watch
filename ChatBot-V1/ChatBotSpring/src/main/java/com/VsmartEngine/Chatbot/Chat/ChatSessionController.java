package com.VsmartEngine.Chatbot.Chat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.VsmartEngine.Chatbot.Admin.AdminRegister;
import com.VsmartEngine.Chatbot.Admin.AdminRegisterRepository;
import com.VsmartEngine.Chatbot.Departments.Department;
import com.VsmartEngine.Chatbot.Departments.DepartmentRepository;
import com.VsmartEngine.Chatbot.UserInfo.UserInfo;
import com.VsmartEngine.Chatbot.UserInfo.UserInfoRepository;

@RestController
@RequestMapping("/chat")
public class ChatSessionController {

    @Autowired private ChatSessionRepository   sessionRepo;
    @Autowired private AdminRegisterRepository agentRepo;
    @Autowired private DepartmentRepository    departmentRepo;
    @Autowired private ChatMessageRepository   messageRepo;
    @Autowired private UserInfoRepository      userinfo;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/claim
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/claim")
    public ResponseEntity<?> claimSession(
            @RequestParam String sessionId,
            @RequestParam String agentEmail) {

        ChatSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        if (session.getReceiver() != null) {
            if (session.getReceiver().equalsIgnoreCase(agentEmail)) {
                return ResponseEntity.ok("Session already claimed by you");
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Session already claimed by another agent");
        }

        AdminRegister agent = agentRepo.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentEmail));

        session.setClaimedBy(agent);
        session.setReceiver(agent.getEmail());
        session.setStatus(true);
        sessionRepo.save(session);

        return ResponseEntity.ok("Session claimed successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chat/sessions/visible
    // Returns only sessions where deleted = false.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/sessions/visible")
    public ResponseEntity<List<MessageDisplay>> getVisibleSessionsForAgent(
            @RequestParam Long agentId) {

        AdminRegister agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));

        String role    = agent.getRole().getRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

        List<ChatSession> sessions;
        if (isAdmin) {
            // ADMIN sees all non-deleted sessions
            sessions = sessionRepo.findByDeletedFalse();
        } else {
            if (agent.getDepartment() != null) {
                sessions = sessionRepo.findByDepartment_IdAndDeletedFalse(agent.getDepartment().getId());
            } else {
                sessions = sessionRepo.findByReceiverAndDeletedFalse(agent.getEmail());
            }
        }

        return ResponseEntity.ok(buildDisplayList(sessions, agent, isAdmin));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chat/sessions/trash
    // Returns soft-deleted sessions so the Trash page can display them.
    // ADMIN: all soft-deleted sessions.
    // AGENT: soft-deleted sessions from their department (or claimed by them).
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/sessions/trash")
    public ResponseEntity<List<MessageDisplay>> getTrashedSessions(
            @RequestParam Long agentId) {

        AdminRegister agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));

        String role     = agent.getRole().getRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

        List<ChatSession> sessions;
        if (isAdmin) {
            sessions = sessionRepo.findByDeletedTrue();
        } else {
            // Filter soft-deleted by department (or receiver as fallback)
            List<ChatSession> all = sessionRepo.findByDeletedTrue();
            sessions = new ArrayList<>();
            for (ChatSession s : all) {
                boolean mine = s.getReceiver() != null
                        && s.getReceiver().equalsIgnoreCase(agent.getEmail());
                boolean myDept = agent.getDepartment() != null
                        && s.getDepartment() != null
                        && s.getDepartment().getId() == agent.getDepartment().getId();
                if (mine || myDept) sessions.add(s);
            }
        }

        return ResponseEntity.ok(buildDisplayList(sessions, agent, isAdmin));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/sessions/{sessionId}/soft-delete
    // Moves a session to Trash (sets deleted = true). Does NOT remove data.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/sessions/{sessionId}/soft-delete")
    public ResponseEntity<?> softDeleteSession(@PathVariable String sessionId) {
        ChatSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setDeleted(true);
        sessionRepo.save(session);
        return ResponseEntity.ok("Session moved to trash");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/sessions/{sessionId}/restore
    // Restores a session from Trash (sets deleted = false).
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/sessions/{sessionId}/restore")
    public ResponseEntity<?> restoreSession(@PathVariable String sessionId) {
        ChatSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setDeleted(false);
        sessionRepo.save(session);
        return ResponseEntity.ok("Session restored");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /chat/sessions/{sessionId}
    // PERMANENT delete — removes messages and session from DB entirely.
    // Only used from Trash page after the session is already soft-deleted.
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        ChatSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        messageRepo.deleteBySessionId(sessionId);
        sessionRepo.delete(session);
        return ResponseEntity.ok("Session permanently deleted");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/setStatusForSessionID
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/setStatusForSessionID")
    public ResponseEntity<?> setStatus(
            @RequestParam String sessionId,
            @RequestParam boolean Status) {

        ChatSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setStatus(Status);
        sessionRepo.save(session);
        return ResponseEntity.ok("Status updated");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chat/history/{sessionId}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/history/{sessionId}")
    public List<ChatMessage> getHistory(@PathVariable String sessionId) {
        return messageRepo.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/start
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startSession(
            @RequestParam String sender,
            @RequestParam String departmentId,
            @RequestParam String content) {

        Department dept = departmentRepo.findById(Long.parseLong(departmentId))
                .orElseThrow(() -> new RuntimeException("Invalid department: " + departmentId));

        ChatSession session = new ChatSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setSender(sender);
        session.setDepartment(dept);
        session.setStatus(false);
        session.setDeleted(false);
        session.setCreatedTime(LocalDateTime.now());
        sessionRepo.save(session);

        ChatMessage message = new ChatMessage();
        message.setSessionId(session.getSessionId());
        message.setSender(sender);
        message.setContent(content);
        message.setRole("USER");
        message.setTimestamp(LocalDateTime.now());
        messageRepo.save(message);

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPER — builds MessageDisplay list from ChatSession list
    // ─────────────────────────────────────────────────────────────────────────
    private List<MessageDisplay> buildDisplayList(
            List<ChatSession> sessions,
            AdminRegister agent,
            boolean isAdmin) {

        List<MessageDisplay> displayList = new ArrayList<>();
        for (ChatSession session : sessions) {

            boolean visible = isAdmin
                    || session.getReceiver() == null
                    || session.getReceiver().equalsIgnoreCase(agent.getEmail());

            if (!visible) continue;

            Long deptId = session.getDepartment() != null
                    ? session.getDepartment().getId() : null;

            MessageDisplay display = new MessageDisplay();
            display.setSessionId(session.getSessionId());
            display.setStatus(session.isStatus());
            display.setDepartmentId(deptId);
            display.setAdminemail(session.getReceiver());

            String senderEmail = session.getSender();
            UserInfo user = (senderEmail != null)
                    ? userinfo.findByEmail(senderEmail).orElse(null)
                    : null;

            if (user != null) {
                display.setUserid(user.getId());
                String displayName = (user.getUsername() != null && !user.getUsername().isBlank())
                        ? user.getUsername()
                        : user.getEmail();
                display.setUsername(displayName);
                display.setUseremail(user.getEmail());
            } else {
                display.setUsername(senderEmail != null ? senderEmail : "Unknown Visitor");
                display.setUseremail(senderEmail);
            }

            ChatMessage latest = messageRepo
                    .findTopBySessionIdOrderByTimestampDesc(session.getSessionId());
            if (latest != null) {
                display.setMessage(latest.getContent());
                display.setTimestamp(latest.getTimestamp());
            }

            displayList.add(display);
        }
        return displayList;
    }
}