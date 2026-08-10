package com.VsmartEngine.Chatbot.Compose;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "compose_attachments")
public class ComposeAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id")
    private String conversationId;

    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "file_name",  nullable = false)
    private String fileName;

    @Column(name = "file_path",  nullable = false)
    private String filePath;

    @Column(name = "file_type",  nullable = false)
    private String fileType;

    @Column(name = "file_size",  nullable = false)
    private Long fileSize;

    @Column(name = "file_url",   nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────
    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public String getConversationId()           { return conversationId; }
    public void setConversationId(String v)     { this.conversationId = v; }

    public Long getMessageId()                  { return messageId; }
    public void setMessageId(Long v)            { this.messageId = v; }

    public String getFileName()                 { return fileName; }
    public void setFileName(String v)           { this.fileName = v; }

    public String getFilePath()                 { return filePath; }
    public void setFilePath(String v)           { this.filePath = v; }

    public String getFileType()                 { return fileType; }
    public void setFileType(String v)           { this.fileType = v; }

    public Long getFileSize()                   { return fileSize; }
    public void setFileSize(Long v)             { this.fileSize = v; }

    public String getFileUrl()                  { return fileUrl; }
    public void setFileUrl(String v)            { this.fileUrl = v; }

    public String getUploadedBy()               { return uploadedBy; }
    public void setUploadedBy(String v)         { this.uploadedBy = v; }

    public LocalDateTime getCreatedAt()         { return createdAt; }
    public void setCreatedAt(LocalDateTime v)   { this.createdAt = v; }
  
}