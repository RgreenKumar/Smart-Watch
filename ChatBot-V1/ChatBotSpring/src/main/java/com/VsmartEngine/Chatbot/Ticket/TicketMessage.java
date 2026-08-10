package com.VsmartEngine.Chatbot.Ticket;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_messages")
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    /** AGENT / CUSTOMER / NOTE */
    @Column(name = "sender_type", nullable = false)
    private String senderType;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "sender_name")
    private String senderName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "attachment_name")
    private String attachmentName;

    /** If true, only agents can see this (internal note) */
    @Column(name = "internal_note")
    private boolean internalNote = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters / Setters ──────────────────────────────────────────────────

    public Long getId()                        { return id; }
    public void setId(Long id)                { this.id = id; }

    public Long getTicketId()                  { return ticketId; }
    public void setTicketId(Long t)           { this.ticketId = t; }

    public String getSenderType()              { return senderType; }
    public void setSenderType(String s)       { this.senderType = s; }

    public String getSenderEmail()             { return senderEmail; }
    public void setSenderEmail(String s)      { this.senderEmail = s; }

    public String getSenderName()              { return senderName; }
    public void setSenderName(String s)       { this.senderName = s; }

    public String getMessage()                 { return message; }
    public void setMessage(String m)          { this.message = m; }

    public String getAttachmentUrl()           { return attachmentUrl; }
    public void setAttachmentUrl(String s)    { this.attachmentUrl = s; }

    public String getAttachmentName()          { return attachmentName; }
    public void setAttachmentName(String s)   { this.attachmentName = s; }

    public boolean isInternalNote()            { return internalNote; }
    public void setInternalNote(boolean b)    { this.internalNote = b; }

    public LocalDateTime getCreatedAt()        { return createdAt; }
    public void setCreatedAt(LocalDateTime d) { this.createdAt = d; }
}