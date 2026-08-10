package com.VsmartEngine.Chatbot.Compose;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "compose_conversations")
public class ComposeConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private String conversationId;

    /** Agent who created this conversation */
    @Column(name = "agent_email", nullable = false)
    private String agentEmail;

    /** Recipient customer email */
    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "subject")
    private String subject;

    /** OPEN | CLOSED | DRAFT */
    @Column(name = "status", nullable = false)
    private String status = "OPEN";

    /** Whether a support ticket was also created */
    @Column(name = "ticket_created")
    private boolean ticketCreated = false;

    @Column(name = "ticket_id")
    private String ticketId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.conversationId = UUID.randomUUID().toString();
        this.createdAt      = LocalDateTime.now();
        this.updatedAt      = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────
    public Long getId()                            { return id; }
    public void setId(Long id)                     { this.id = id; }

    public String getConversationId()              { return conversationId; }
    public void setConversationId(String v)        { this.conversationId = v; }

    public String getAgentEmail()                  { return agentEmail; }
    public void setAgentEmail(String v)            { this.agentEmail = v; }

    public String getRecipientEmail()              { return recipientEmail; }
    public void setRecipientEmail(String v)        { this.recipientEmail = v; }

    public String getRecipientName()               { return recipientName; }
    public void setRecipientName(String v)         { this.recipientName = v; }

    public String getSubject()                     { return subject; }
    public void setSubject(String v)               { this.subject = v; }

    public String getStatus()                      { return status; }
    public void setStatus(String v)                { this.status = v; }

    public boolean isTicketCreated()               { return ticketCreated; }
    public void setTicketCreated(boolean v)        { this.ticketCreated = v; }

    public String getTicketId()                    { return ticketId; }
    public void setTicketId(String v)              { this.ticketId = v; }

    public LocalDateTime getCreatedAt()            { return createdAt; }
    public void setCreatedAt(LocalDateTime v)      { this.createdAt = v; }

    public LocalDateTime getUpdatedAt()            { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)      { this.updatedAt = v; }
}