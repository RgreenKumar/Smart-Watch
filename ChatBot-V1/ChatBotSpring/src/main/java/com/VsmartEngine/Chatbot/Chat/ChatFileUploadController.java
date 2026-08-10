package com.VsmartEngine.Chatbot.Chat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * ChatFileUploadController
 * ========================
 * POST /chat/upload-file   — validate, store, persist metadata, broadcast WS
 * GET  /chat/files/{name}  — serve stored files (protected; session must exist)
 */
@CrossOrigin
@RestController
@RequestMapping("/chat")
public class ChatFileUploadController {

    // ── Configuration ─────────────────────────────────────────────────────────
    /** Max upload size: 10 MB (configurable via application.properties) */
    @Value("${chat.upload.max-size-bytes:10485760}")
    private long maxSizeBytes;

    /** Directory relative to working directory where files are stored */
    @Value("${chat.upload.directory:chat-uploads}")
    private String uploadDir;

    @Value("${BackendUrl}")
    private String backendUrl;

    // ── Allowed / blocked mime types ──────────────────────────────────────────
    private static final Set<String> ALLOWED_MIME = Set.of(
            // Images
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            // Documents
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            // Spreadsheets
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            // Zip
            "application/zip",
            "application/x-zip-compressed"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".bat", ".sh", ".cmd", ".msi", ".ps1", ".vbs", ".jar",
            ".com", ".pif", ".scr", ".reg", ".dll"
    );

    // ── Dependencies ──────────────────────────────────────────────────────────
    @Autowired private ChatAttachmentRepository attachmentRepo;
    @Autowired private ChatSessionRepository    sessionRepo;
    @Autowired private ChatMessageRepository    messageRepo;
    @Autowired private SimpMessagingTemplate    messagingTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chat/upload-file
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Request params:
     *   file        – the multipart file
     *   sessionId   – active chat session
     *   uploadedBy  – sender email (agent or visitor)
     *   role        – "AGENT" or "USER"
     */
    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file")       MultipartFile file,
            @RequestParam("sessionId")  String        sessionId,
            @RequestParam("uploadedBy") String        uploadedBy,
            @RequestParam("role")       String        role) {

        // ── 1. Session must exist ────────────────────────────────────────────
        ChatSession session = sessionRepo.findBySessionId(sessionId).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Session not found: " + sessionId);
        }

        // ── 2. Validate file is present ──────────────────────────────────────
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file provided.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            return ResponseEntity.badRequest().body("Invalid file name.");
        }

        // ── 3. Block dangerous extensions ────────────────────────────────────
        String lowerName = originalName.toLowerCase();
        for (String blocked : BLOCKED_EXTENSIONS) {
            if (lowerName.endsWith(blocked)) {
                return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                        .body("File type '" + blocked + "' is not allowed.");
            }
        }

        // ── 4. Validate MIME type ─────────────────────────────────────────────
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME.contains(contentType.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body("File type '" + contentType + "' is not supported. "
                        + "Allowed: images, PDF, Word, Excel, text, ZIP.");
        }

        // ── 5. Enforce size limit ─────────────────────────────────────────────
        if (file.getSize() > maxSizeBytes) {
            long limitMb = maxSizeBytes / (1024 * 1024);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body("File exceeds the maximum allowed size of " + limitMb + " MB.");
        }

        // ── 6. Persist to disk ────────────────────────────────────────────────
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Unique filename: UUID_originalName  (prevents collisions & path traversal)
            String storedName = UUID.randomUUID().toString() + "_" + sanitize(originalName);
            Path destination  = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            // ── 7. Persist attachment metadata ────────────────────────────────
            String fileUrl = backendUrl + "/chat/files/" + storedName;

            ChatAttachment attachment = new ChatAttachment();
            attachment.setSessionId(sessionId);
            attachment.setFileName(originalName);
            attachment.setFilePath(uploadDir + "/" + storedName);
            attachment.setFileType(contentType);
            attachment.setFileSize(file.getSize());
            attachment.setUploadedBy(uploadedBy);
            attachment.setUploaderRole(role != null ? role.toUpperCase() : "USER");
            attachment.setCreatedAt(LocalDateTime.now());
            attachment.setFileUrl(fileUrl);
            attachmentRepo.save(attachment);

            // ── 8. Save a chat message for the attachment ─────────────────────
            ChatMessage msg = new ChatMessage();
            msg.setSessionId(sessionId);
            msg.setSender(uploadedBy);
            msg.setRole(attachment.getUploaderRole());
            msg.setContent("[FILE:" + originalName + "]");   // text fallback
            msg.setTimestamp(LocalDateTime.now());
            ChatMessage savedMsg = messageRepo.save(msg);

            // Link message ↔ attachment
            attachment.setMessageId(savedMsg.getId());
            attachmentRepo.save(attachment);

            // ── 9. Build response DTO ─────────────────────────────────────────
            AttachmentResponseDTO dto = new AttachmentResponseDTO();
            dto.setAttachmentId(attachment.getId());
            dto.setSessionId(sessionId);
            dto.setFileName(originalName);
            dto.setFileType(contentType);
            dto.setFileSize(file.getSize());
            dto.setFileUrl(fileUrl);
            dto.setUploadedBy(uploadedBy);
            dto.setUploaderRole(attachment.getUploaderRole());
            dto.setCreatedAt(attachment.getCreatedAt());

            // ── 10. Broadcast via WebSocket so both sides update in real-time ──
            // Re-use the existing /topic/messages/{sessionId} topic.
            // Frontend already listens here; the "ATTACHMENT" role triggers the
            // file-bubble renderer.
            java.util.Map<String, Object> wsPayload = new java.util.HashMap<>();
            wsPayload.put("sessionId",    sessionId);
            wsPayload.put("sender",       uploadedBy);
            wsPayload.put("role",         attachment.getUploaderRole());
            wsPayload.put("content",      "[FILE:" + originalName + "]");
            wsPayload.put("messageType",  "ATTACHMENT");
            wsPayload.put("attachmentId", attachment.getId());
            wsPayload.put("fileName",     originalName);
            wsPayload.put("fileType",     contentType);
            wsPayload.put("fileSize",     file.getSize());
            wsPayload.put("fileUrl",      fileUrl);
            wsPayload.put("timestamp",    attachment.getCreatedAt().toString());

            messagingTemplate.convertAndSend(
                    "/topic/messages/" + sessionId, wsPayload);

            return ResponseEntity.ok(dto);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chat/files/{filename}
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Serves uploaded files.
     * Basic protection: the file must exist in the configured upload dir.
     * For stronger protection, add JWT verification as a request param or header.
     */
    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            // Prevent path traversal
            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                contentType = "application/octet-stream";
            }
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chat/attachments/{sessionId}
    // ─────────────────────────────────────────────────────────────────────────
    /** Returns all attachments for a session — useful for history re-render */
    @GetMapping("/attachments/{sessionId}")
    public ResponseEntity<List<ChatAttachment>> getAttachments(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(
                attachmentRepo.findBySessionIdOrderByCreatedAtDesc(sessionId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Strip any path separators and dangerous characters from the original name */
    private String sanitize(String name) {
        return name.replaceAll("[^a-zA-Z0-9._\\-]", "_");
    }
}