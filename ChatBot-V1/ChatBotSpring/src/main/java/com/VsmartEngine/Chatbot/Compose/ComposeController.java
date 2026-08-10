package com.VsmartEngine.Chatbot.Compose;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.VsmartEngine.Chatbot.Chat.ChatMessage;
import com.VsmartEngine.Chatbot.Chat.ChatMessageRepository;
import com.VsmartEngine.Chatbot.Chat.ChatSession;
import com.VsmartEngine.Chatbot.Chat.ChatSessionRepository;
import com.VsmartEngine.Chatbot.Departments.Department;
import com.VsmartEngine.Chatbot.Departments.DepartmentRepository;
import com.VsmartEngine.Chatbot.MailConfiguration.EmailService;
import com.VsmartEngine.Chatbot.UserInfo.UserInfo;
import com.VsmartEngine.Chatbot.UserInfo.UserInfoRepository;

import java.time.LocalDateTime;

/**
 * ComposeController
 * =================
 * Provides all backend APIs for the Compose / New Conversation feature.
 *
 * POST /compose/create-conversation   — create conversation + send first message
 * POST /compose/send-message          — add a follow-up message to a conversation
 * POST /compose/save-draft            — upsert a draft for an agent
 * GET  /compose/drafts/{agentEmail}   — list agent's saved drafts
 * DELETE /compose/drafts/{id}         — delete a draft
 * GET  /compose/conversations/{email} — list conversations for an agent
 * GET  /compose/conversation/{id}     — full conversation thread
 * POST /compose/upload-attachment     — upload a file and attach to conversation
 * GET  /compose/search-users          — search existing users by email/name
 */
@CrossOrigin
@RestController
@RequestMapping("/compose")
public class ComposeController {

    // ── File upload config ─────────────────────────────────────────────────
    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip", "application/x-zip-compressed"
    );
    private static final Set<String> BLOCKED_EXT = Set.of(
            ".exe", ".bat", ".sh", ".cmd", ".msi", ".ps1", ".vbs",
            ".jar", ".com", ".pif", ".scr", ".reg", ".dll"
    );

    @Value("${chat.upload.directory:chat-uploads}")
    private String uploadDir;

    @Value("${BackendUrl}")
    private String backendUrl;

    // ── Dependencies ───────────────────────────────────────────────────────
    @Autowired private ComposeConversationRepository convRepo;
    @Autowired private ComposeMessageRepository      msgRepo;
    @Autowired private ComposeDraftRepository        draftRepo;
    @Autowired private ComposeAttachmentRepository   attachRepo;
    @Autowired private UserInfoRepository            userRepo;
    @Autowired private ChatSessionRepository         chatSessionRepo;
    @Autowired private ChatMessageRepository         chatMessageRepo;
    @Autowired private DepartmentRepository          deptRepo;
    @Autowired private SimpMessagingTemplate         messagingTemplate;
    @Autowired private EmailService                  emailService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /compose/create-conversation
    //
    // Request params (multipart/form-data or application/x-www-form-urlencoded):
    //   agentEmail, recipientEmail, recipientName, subject,
    //   content (HTML), createTicket (boolean), departmentId (optional)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/create-conversation")
    public ResponseEntity<?> createConversation(
            @RequestParam("agentEmail")      String  agentEmail,
            @RequestParam("recipientEmail")  String  recipientEmail,
            @RequestParam(value = "recipientName",  defaultValue = "")  String recipientName,
            @RequestParam(value = "subject",        defaultValue = "")  String subject,
            @RequestParam("content")         String  content,
            @RequestParam(value = "createTicket",   defaultValue = "false") boolean createTicket,
            @RequestParam(value = "departmentId",   required = false)   Long    departmentId) {

        // Validation
        if (agentEmail.isBlank() || recipientEmail.isBlank() || content.isBlank()) {
            return ResponseEntity.badRequest().body("agentEmail, recipientEmail, and content are required.");
        }

        // Ensure recipient exists as a UserInfo (create if new)
        UserInfo recipient = userRepo.findByEmail(recipientEmail).orElseGet(() -> {
            String displayName = recipientName.isBlank() ? recipientEmail : recipientName;
            return userRepo.save(new UserInfo(displayName, recipientEmail, "USER"));
        });

        // ── 1. Create ComposeConversation record ──────────────────────────
        ComposeConversation conv = new ComposeConversation();
        conv.setAgentEmail(agentEmail);
        conv.setRecipientEmail(recipientEmail);
        conv.setRecipientName(recipient.getUsername() != null ? recipient.getUsername() : recipientEmail);
        conv.setSubject(subject.isBlank() ? "(No subject)" : subject);
        conv.setStatus("OPEN");

        // ── 2. Optional ticket integration ────────────────────────────────
        if (createTicket) {
            conv.setTicketCreated(true);
            conv.setTicketId("TICKET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        conv = convRepo.save(conv);

        // ── 3. Save the first message ─────────────────────────────────────
        ComposeMessage firstMsg = new ComposeMessage();
        firstMsg.setConversationId(conv.getConversationId());
        firstMsg.setContent(content);
        firstMsg.setSenderRole("AGENT");
        firstMsg.setSenderEmail(agentEmail);
        firstMsg = msgRepo.save(firstMsg);

        // ── 4. Mirror into ChatSession/ChatMessage so it shows in Inbox ───
        Department dept = (departmentId != null)
                ? deptRepo.findById(departmentId).orElse(null)
                : deptRepo.findAll().stream().findFirst().orElse(null);

        ChatSession chatSession = new ChatSession();
        chatSession.setSessionId(conv.getConversationId());
        chatSession.setSender(recipientEmail);
        chatSession.setReceiver(agentEmail);
        chatSession.setDepartment(dept);
        chatSession.setStatus(true);         // ACTIVE — agent initiated
        chatSession.setDeleted(false);
        chatSession.setCreatedTime(LocalDateTime.now());
        chatSessionRepo.save(chatSession);

        ChatMessage chatMsg = new ChatMessage();
        chatMsg.setSessionId(conv.getConversationId());
        chatMsg.setSender(agentEmail);
        chatMsg.setReceiver(recipientEmail);
        chatMsg.setContent(stripHtml(content));
        chatMsg.setRole("AGENT");
        chatMsg.setTimestamp(LocalDateTime.now());
        chatMessageRepo.save(chatMsg);

        // ── 5. WebSocket broadcast so Inbox updates in real-time ──────────
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("conversationId", conv.getConversationId());
        wsPayload.put("agentEmail",     agentEmail);
        wsPayload.put("recipientEmail", recipientEmail);
        wsPayload.put("subject",        conv.getSubject());
        wsPayload.put("messagePreview", stripHtml(content).substring(0, Math.min(80, stripHtml(content).length())));
        wsPayload.put("timestamp",      conv.getCreatedAt().toString());
        wsPayload.put("type",           "NEW_CONVERSATION");
        messagingTemplate.convertAndSend("/topic/compose/inbox", wsPayload);

        // ── 6. Send customer email notification ───────────────────────────
        String emailSubject = subject.isBlank() ? "New message from support" : subject;
        String emailBody = "Hello " + (recipientName.isBlank() ? "" : recipientName) + ",\n\n"
                + "You have received a new message from our support team:\n\n"
                + stripHtml(content) + "\n\n"
                + "Please reply to this email or contact our support.\n\n"
                + "Regards,\nSupport Team";
        emailService.sendEmail(recipientEmail, emailSubject, emailBody);

        // ── 7. Build response ─────────────────────────────────────────────
        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conv.getConversationId());
        response.put("messageId",      firstMsg.getId());
        response.put("ticketId",       conv.getTicketId());
        response.put("status",         "sent");
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /compose/send-message
    // Add a follow-up message to an existing conversation.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/send-message")
    public ResponseEntity<?> sendMessage(
            @RequestParam("conversationId") String conversationId,
            @RequestParam("senderEmail")    String senderEmail,
            @RequestParam("senderRole")     String senderRole,
            @RequestParam("content")        String content) {

        ComposeConversation conv = convRepo.findByConversationId(conversationId).orElse(null);
        if (conv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conversation not found.");
        if (content.isBlank()) return ResponseEntity.badRequest().body("Content is required.");

        ComposeMessage msg = new ComposeMessage();
        msg.setConversationId(conversationId);
        msg.setContent(content);
        msg.setSenderRole(senderRole.toUpperCase());
        msg.setSenderEmail(senderEmail);
        msg = msgRepo.save(msg);

        // Mirror into chat messages for Inbox view
        ChatMessage chatMsg = new ChatMessage();
        chatMsg.setSessionId(conversationId);
        chatMsg.setSender(senderEmail);
        chatMsg.setContent(stripHtml(content));
        chatMsg.setRole(senderRole.toUpperCase());
        chatMsg.setTimestamp(LocalDateTime.now());
        chatMessageRepo.save(chatMsg);

        // Broadcast
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("conversationId", conversationId);
        wsPayload.put("messageId",      msg.getId());
        wsPayload.put("senderEmail",    senderEmail);
        wsPayload.put("senderRole",     senderRole);
        wsPayload.put("content",        content);
        wsPayload.put("timestamp",      msg.getCreatedAt().toString());
        messagingTemplate.convertAndSend("/topic/messages/" + conversationId, wsPayload);

        Map<String, Object> response = new HashMap<>();
        response.put("messageId", msg.getId());
        response.put("status",    "sent");
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /compose/save-draft
    // Upsert draft: one draft per agent (overwrite existing).
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/save-draft")
    public ResponseEntity<?> saveDraft(
            @RequestParam("agentEmail")      String  agentEmail,
            @RequestParam(value = "recipientEmail", defaultValue = "")  String recipientEmail,
            @RequestParam(value = "recipientName",  defaultValue = "")  String recipientName,
            @RequestParam(value = "subject",        defaultValue = "")  String subject,
            @RequestParam(value = "content",        defaultValue = "")  String content,
            @RequestParam(value = "createTicket",   defaultValue = "false") boolean createTicket,
            @RequestParam(value = "draftId",        required = false)   Long    draftId) {

        ComposeDraft draft;
        if (draftId != null) {
            draft = draftRepo.findById(draftId).orElse(new ComposeDraft());
        } else {
            draft = new ComposeDraft();
        }
        draft.setAgentEmail(agentEmail);
        draft.setRecipientEmail(recipientEmail);
        draft.setRecipientName(recipientName);
        draft.setSubject(subject);
        draft.setContent(content);
        draft.setCreateTicket(createTicket);
        draft = draftRepo.save(draft);

        Map<String, Object> response = new HashMap<>();
        response.put("draftId", draft.getId());
        response.put("status",  "saved");
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /compose/drafts/{agentEmail}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/drafts/{agentEmail}")
    public ResponseEntity<?> getDrafts(@PathVariable String agentEmail) {
        return ResponseEntity.ok(draftRepo.findByAgentEmailOrderByUpdatedAtDesc(agentEmail));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /compose/drafts/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/drafts/{id}")
    public ResponseEntity<?> deleteDraft(@PathVariable Long id) {
        draftRepo.deleteById(id);
        return ResponseEntity.ok("Draft deleted");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /compose/conversations/{agentEmail}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/conversations/{agentEmail}")
    public ResponseEntity<?> getConversations(@PathVariable String agentEmail) {
        return ResponseEntity.ok(
                convRepo.findByAgentEmailOrderByCreatedAtDesc(agentEmail));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /compose/conversation/{conversationId}
    // Returns the conversation + all messages + attachments
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<?> getConversationThread(@PathVariable String conversationId) {
        ComposeConversation conv = convRepo.findByConversationId(conversationId).orElse(null);
        if (conv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found.");

        Map<String, Object> result = new HashMap<>();
        result.put("conversation", conv);
        result.put("messages",     msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId));
        result.put("attachments",  attachRepo.findByConversationId(conversationId));
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /compose/upload-attachment
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/upload-attachment")
    public ResponseEntity<?> uploadAttachment(
            @RequestParam("file")            MultipartFile file,
            @RequestParam("agentEmail")      String        agentEmail,
            @RequestParam(value = "conversationId", required = false) String conversationId) {

        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body("No file.");

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) return ResponseEntity.badRequest().body("Invalid filename.");

        String lowerName = originalName.toLowerCase();
        for (String ext : BLOCKED_EXT) {
            if (lowerName.endsWith(ext))
                return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body("File type not allowed.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME.contains(contentType.toLowerCase()))
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body("MIME type not supported: " + contentType);

        if (file.getSize() > 10 * 1024 * 1024)
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("File exceeds 10 MB.");

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String storedName = UUID.randomUUID() + "_" + sanitize(originalName);
            Files.copy(file.getInputStream(), uploadPath.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = backendUrl + "/chat/files/" + storedName;

            ComposeAttachment att = new ComposeAttachment();
            att.setConversationId(conversationId);
            att.setFileName(originalName);
            att.setFilePath(uploadDir + "/" + storedName);
            att.setFileType(contentType);
            att.setFileSize(file.getSize());
            att.setFileUrl(fileUrl);
            att.setUploadedBy(agentEmail);
            att = attachRepo.save(att);

            Map<String, Object> resp = new HashMap<>();
            resp.put("attachmentId", att.getId());
            resp.put("fileName",     originalName);
            resp.put("fileType",     contentType);
            resp.put("fileSize",     file.getSize());
            resp.put("fileUrl",      fileUrl);
            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /compose/search-users?q=query
    // Search existing users by name or email for the recipient field.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/search-users")
    public ResponseEntity<?> searchUsers(@RequestParam("q") String query) {
        if (query.isBlank() || query.length() < 2)
            return ResponseEntity.ok(Collections.emptyList());

        String lower = query.toLowerCase();
        List<UserInfo> all = userRepo.findAll();
        List<Map<String, String>> results = new ArrayList<>();
        for (UserInfo u : all) {
            boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(lower);
            boolean matchName  = u.getUsername() != null && u.getUsername().toLowerCase().contains(lower);
            if (matchEmail || matchName) {
                Map<String, String> item = new HashMap<>();
                item.put("email", u.getEmail());
                item.put("name",  u.getUsername() != null ? u.getUsername() : u.getEmail());
                results.add(item);
                if (results.size() >= 10) break;
            }
        }
        return ResponseEntity.ok(results);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String sanitize(String name) {
        return name.replaceAll("[^a-zA-Z0-9._\\-]", "_");
    }

    /** Strip HTML tags for plain-text fallback (email body / chat message preview) */
    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ").replaceAll("\\s{2,}", " ").trim();
    }
}