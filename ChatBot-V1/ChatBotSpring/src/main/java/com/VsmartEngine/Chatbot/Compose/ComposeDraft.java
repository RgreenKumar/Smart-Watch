package com.VsmartEngine.Chatbot.Compose;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "compose_drafts")
public class ComposeDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_email", nullable = false)
    private String agentEmail;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "subject")
    private String subject;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "create_ticket")
    private boolean createTicket = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────
    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public String getAgentEmail()               { return agentEmail; }
    public void setAgentEmail(String v)         { this.agentEmail = v; }

    public String getRecipientEmail()           { return recipientEmail; }
    public void setRecipientEmail(String v)     { this.recipientEmail = v; }

    public String getRecipientName()            { return recipientName; }
    public void setRecipientName(String v)      { this.recipientName = v; }

    public String getSubject()                  { return subject; }
    public void setSubject(String v)            { this.subject = v; }

    public String getContent()                  { return content; }
    public void setContent(String v)            { this.content = v; }

    public boolean isCreateTicket()             { return createTicket; }
    public void setCreateTicket(boolean v)      { this.createTicket = v; }

    public LocalDateTime getUpdatedAt()         { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)   { this.updatedAt = v; }
}