package com.VsmartEngine.Chatbot.Compose;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "compose_messages")
public class ComposeMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    /** HTML content from the rich-text editor */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /** AGENT | CUSTOMER | SYSTEM */
    @Column(name = "sender_role", nullable = false)
    private String senderRole;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "created_at", nullable = false)
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

    public String getContent()                  { return content; }
    public void setContent(String v)            { this.content = v; }

    public String getSenderRole()               { return senderRole; }
    public void setSenderRole(String v)         { this.senderRole = v; }

    public String getSenderEmail()              { return senderEmail; }
    public void setSenderEmail(String v)        { this.senderEmail = v; }

    public LocalDateTime getCreatedAt()         { return createdAt; }
    public void setCreatedAt(LocalDateTime v)   { this.createdAt = v; }
}