package com.VsmartEngine.Chatbot.Ticket;

import com.VsmartEngine.Chatbot.Admin.AdminRegister;
import com.VsmartEngine.Chatbot.Admin.AdminRegisterRepository;
import com.VsmartEngine.Chatbot.Chat.ChatMessage;
import com.VsmartEngine.Chatbot.Chat.ChatMessageRepository;
import com.VsmartEngine.Chatbot.Chat.ChatSession;
import com.VsmartEngine.Chatbot.Chat.ChatSessionRepository;
import com.VsmartEngine.Chatbot.MailConfiguration.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

/**
 * TicketController
 * ================
 * POST   /tickets                     — create ticket
 * GET    /tickets                     — list all tickets (optional ?status=OPEN)
 * GET    /tickets/{id}                — get single ticket with messages
 * POST   /tickets/{id}/reply          — agent reply (sends email + updates status)
 * PATCH  /tickets/{id}/status         — change status
 * POST   /tickets/{id}/assign         — assign to agent
 * POST   /tickets/{id}/note           — add internal note
 * POST   /tickets/from-chat/{sid}     — convert chat session → ticket
 * GET    /tickets/stats               — badge counts per status
 * DELETE /tickets/{id}                — permanent delete
 */
@CrossOrigin
@RestController
@RequestMapping("/tickets")
public class TicketController {

    @Value("${chat.upload.directory:chat-uploads}")
    private String uploadDir;

    @Value("${BackendUrl}")
    private String backendUrl;

    @Autowired private TicketRepository        ticketRepo;
    @Autowired private TicketMessageRepository msgRepo;
    @Autowired private AdminRegisterRepository agentRepo;
    @Autowired private ChatSessionRepository   chatSessionRepo;
    @Autowired private ChatMessageRepository   chatMessageRepo;
    @Autowired private EmailService            emailService;
    @Autowired private SimpMessagingTemplate   ws;

    // ── POST /tickets ─────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @RequestParam String subject,
            @RequestParam String customerEmail,
            @RequestParam(required = false, defaultValue = "") String customerName,
            @RequestParam(required = false, defaultValue = "MEDIUM") String priority,
            @RequestParam(required = false, defaultValue = "") String tags,
            @RequestParam(required = false, defaultValue = "MANUAL") String source,
            @RequestParam(required = false, defaultValue = "") String message,
            @RequestParam(required = false, defaultValue = "") String createdBy,
            @RequestParam(required = false) MultipartFile attachment) {

        Ticket ticket = new Ticket();
        ticket.setSubject(subject);
        ticket.setCustomerEmail(customerEmail);
        ticket.setCustomerName(customerName.isBlank() ? customerEmail : customerName);
        ticket.setPriority(priority);
        ticket.setTags(tags);
        ticket.setSource(source);
        ticket.setCreatedBy(createdBy);
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepo.save(ticket);

        // Save first message if provided
        if (!message.isBlank()) {
            TicketMessage tm = new TicketMessage();
            tm.setTicketId(ticket.getId());
            tm.setSenderType("CUSTOMER");
            tm.setSenderEmail(customerEmail);
            tm.setSenderName(ticket.getCustomerName());
            tm.setMessage(message);
            tm.setCreatedAt(LocalDateTime.now());

            if (attachment != null && !attachment.isEmpty()) {
                String url = saveAttachment(attachment);
                if (url != null) {
                    tm.setAttachmentUrl(url);
                    tm.setAttachmentName(attachment.getOriginalFilename());
                }
            }
            msgRepo.save(tm);
        }

        // WebSocket broadcast for real-time badge update
        ws.convertAndSend("/topic/tickets/new", Map.of(
                "ticketId", ticket.getId(),
                "subject",  ticket.getSubject(),
                "status",   ticket.getStatus()
        ));

        return ResponseEntity.ok(ticket);
    }

    // ── GET /tickets ──────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<TicketListDTO>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String agentEmail) {

        List<Ticket> tickets;

        if (q != null && !q.isBlank()) {
            tickets = ticketRepo.search(q);
        } else if (status != null && !status.isBlank() && !status.equals("ALL")) {
            tickets = ticketRepo.findByStatusOrderByUpdatedAtDesc(status);
        } else if (agentEmail != null && !agentEmail.isBlank()) {
            tickets = ticketRepo.findByAssignedAgentOrderByUpdatedAtDesc(agentEmail);
        } else {
            tickets = ticketRepo.findAllByOrderByUpdatedAtDesc();
        }

        List<TicketListDTO> dtos = tickets.stream().map(t -> {
            long msgCount = msgRepo.countByTicketId(t.getId());
            return new TicketListDTO(t, msgCount);
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    // ── GET /tickets/{id} ─────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailDTO> getTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        List<TicketMessage> messages = msgRepo.findByTicketIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(new TicketDetailDTO(ticket, messages));
    }

    // ── POST /tickets/{id}/reply ──────────────────────────────────────────────
    @PostMapping("/{id}/reply")
    public ResponseEntity<TicketMessage> reply(
            @PathVariable Long id,
            @RequestParam String agentEmail,
            @RequestParam String agentName,
            @RequestParam String message,
            @RequestParam(required = false) MultipartFile attachment) {

        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        TicketMessage msg = new TicketMessage();
        msg.setTicketId(id);
        msg.setSenderType("AGENT");
        msg.setSenderEmail(agentEmail);
        msg.setSenderName(agentName);
        msg.setMessage(message);
        msg.setCreatedAt(LocalDateTime.now());

        if (attachment != null && !attachment.isEmpty()) {
            String url = saveAttachment(attachment);
            if (url != null) {
                msg.setAttachmentUrl(url);
                msg.setAttachmentName(attachment.getOriginalFilename());
            }
        }
        msgRepo.save(msg);

        // Auto-status: agent reply → PENDING
        if (!"CLOSED".equals(ticket.getStatus())) {
            ticket.setStatus("PENDING");
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepo.save(ticket);

        // Send email to customer
        String emailBody = buildEmailBody(ticket, message, agentName);
        emailService.sendEmail(
                ticket.getCustomerEmail(),
                "Re: [Ticket #" + id + "] " + ticket.getSubject(),
                emailBody
        );

        // WebSocket broadcast
        ws.convertAndSend("/topic/tickets/" + id, Map.of(
                "type",    "REPLY",
                "message", message,
                "sender",  agentName,
                "status",  ticket.getStatus()
        ));

        return ResponseEntity.ok(msg);
    }

    // ── PATCH /tickets/{id}/status ────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> changeStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        ticket.setStatus(status.toUpperCase());
        ticket.setUpdatedAt(LocalDateTime.now());
        if ("CLOSED".equals(status.toUpperCase())) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        ticketRepo.save(ticket);

        ws.convertAndSend("/topic/tickets/" + id, Map.of(
                "type",   "STATUS",
                "status", ticket.getStatus()
        ));

        return ResponseEntity.ok(ticket);
    }

    // ── POST /tickets/{id}/assign ─────────────────────────────────────────────
    @PostMapping("/{id}/assign")
    public ResponseEntity<Ticket> assign(
            @PathVariable Long id,
            @RequestParam String agentEmail) {

        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));

        AdminRegister agent = agentRepo.findByEmail(agentEmail).orElse(null);
        ticket.setAssignedAgent(agentEmail);
        ticket.setAssignedAgentName(agent != null ? agent.getUsername() : agentEmail);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepo.save(ticket);

        ws.convertAndSend("/topic/tickets/" + id, Map.of(
                "type",  "ASSIGN",
                "agent", ticket.getAssignedAgentName()
        ));

        return ResponseEntity.ok(ticket);
    }

    // ── POST /tickets/{id}/note ───────────────────────────────────────────────
    @PostMapping("/{id}/note")
    public ResponseEntity<TicketMessage> addNote(
            @PathVariable Long id,
            @RequestParam String agentEmail,
            @RequestParam String agentName,
            @RequestParam String note) {

        TicketMessage msg = new TicketMessage();
        msg.setTicketId(id);
        msg.setSenderType("NOTE");
        msg.setSenderEmail(agentEmail);
        msg.setSenderName(agentName);
        msg.setMessage(note);
        msg.setInternalNote(true);
        msg.setCreatedAt(LocalDateTime.now());
        msgRepo.save(msg);

        Ticket ticket = ticketRepo.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setUpdatedAt(LocalDateTime.now());
            ticketRepo.save(ticket);
        }

        ws.convertAndSend("/topic/tickets/" + id, Map.of(
                "type", "NOTE",
                "note", note
        ));

        return ResponseEntity.ok(msg);
    }

    // ── POST /tickets/from-chat/{sessionId} ───────────────────────────────────
    @PostMapping("/from-chat/{sessionId}")
    public ResponseEntity<Ticket> fromChat(
            @PathVariable String sessionId,
            @RequestParam String subject,
            @RequestParam(required = false, defaultValue = "MEDIUM") String priority,
            @RequestParam(required = false, defaultValue = "") String createdBy) {

        ChatSession session = chatSessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        Ticket ticket = new Ticket();
        ticket.setSubject(subject);
        ticket.setCustomerEmail(session.getSender() != null ? session.getSender() : "unknown");
        ticket.setCustomerName(session.getSender() != null ? session.getSender() : "Visitor");
        ticket.setPriority(priority);
        ticket.setSource("CHAT");
        ticket.setSessionId(sessionId);
        ticket.setCreatedBy(createdBy);
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepo.save(ticket);

        // Import chat messages as ticket messages
        List<ChatMessage> chatMsgs = chatMessageRepo.findBySessionIdOrderByTimestampAsc(sessionId);
        for (ChatMessage cm : chatMsgs) {
            TicketMessage tm = new TicketMessage();
            tm.setTicketId(ticket.getId());
            boolean isAgent = "AGENT".equalsIgnoreCase(cm.getRole()) || "ADMIN".equalsIgnoreCase(cm.getRole());
            tm.setSenderType(isAgent ? "AGENT" : "CUSTOMER");
            tm.setSenderEmail(cm.getSender());
            tm.setSenderName(cm.getSender());
            tm.setMessage(cm.getContent() != null ? cm.getContent() : "");
            tm.setCreatedAt(cm.getTimestamp() != null ? cm.getTimestamp() : LocalDateTime.now());
            msgRepo.save(tm);
        }

        ws.convertAndSend("/topic/tickets/new", Map.of(
                "ticketId", ticket.getId(),
                "source",   "CHAT"
        ));

        return ResponseEntity.ok(ticket);
    }

    // ── GET /tickets/stats ────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("OPEN",    ticketRepo.countByStatus("OPEN"));
        stats.put("PENDING", ticketRepo.countByStatus("PENDING"));
        stats.put("CLOSED",  ticketRepo.countByStatus("CLOSED"));
        stats.put("TOTAL",   ticketRepo.count());
        return ResponseEntity.ok(stats);
    }

    // ── DELETE /tickets/{id} ──────────────────────────────────────────────────
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        msgRepo.deleteByTicketId(id);
        ticketRepo.deleteById(id);
        return ResponseEntity.ok("Ticket deleted");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String saveAttachment(MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            String name = UUID.randomUUID() + "_" + file.getOriginalFilename()
                    .replaceAll("[^a-zA-Z0-9._\\-]", "_");
            Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            return backendUrl + "/chat/files/" + name;
        } catch (IOException e) {
            return null;
        }
    }

    private String buildEmailBody(Ticket ticket, String message, String agentName) {
        return "Hello " + ticket.getCustomerName() + ",\n\n" +
               agentName + " has replied to your support ticket.\n\n" +
               "Ticket: [#" + ticket.getId() + "] " + ticket.getSubject() + "\n\n" +
               "Message:\n" + message + "\n\n" +
               "---\nThis is an automated message. Please do not reply directly to this email.";
    }
}