package com.VsmartEngine.Chatbot.Ticket;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    /** OPEN / PENDING / CLOSED */
    @Column(nullable = false)
    private String status = "OPEN";

    /** LOW / MEDIUM / HIGH / URGENT */
    @Column(nullable = false)
    private String priority = "MEDIUM";

    @Column(name = "assigned_agent")
    private String assignedAgent;           // agent email

    @Column(name = "assigned_agent_name")
    private String assignedAgentName;

    /** Comma-separated tags */
    private String tags;

    /** Source of the ticket: MANUAL / CHAT / EMAIL / FORM */
    private String source = "MANUAL";

    /** If created from a chat session */
    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "created_by")
    private String createdBy;               // agent email who created it

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    // ── Getters / Setters ──────────────────────────────────────────────────

    public Long getId()                       { return id; }
    public void setId(Long id)               { this.id = id; }

    public String getSubject()               { return subject; }
    public void setSubject(String s)         { this.subject = s; }

    public String getCustomerName()          { return customerName; }
    public void setCustomerName(String s)    { this.customerName = s; }

    public String getCustomerEmail()         { return customerEmail; }
    public void setCustomerEmail(String s)   { this.customerEmail = s; }

    public String getStatus()                { return status; }
    public void setStatus(String s)          { this.status = s; }

    public String getPriority()              { return priority; }
    public void setPriority(String p)        { this.priority = p; }

    public String getAssignedAgent()         { return assignedAgent; }
    public void setAssignedAgent(String s)   { this.assignedAgent = s; }

    public String getAssignedAgentName()     { return assignedAgentName; }
    public void setAssignedAgentName(String s) { this.assignedAgentName = s; }

    public String getTags()                  { return tags; }
    public void setTags(String t)            { this.tags = t; }

    public String getSource()                { return source; }
    public void setSource(String s)          { this.source = s; }

    public String getSessionId()             { return sessionId; }
    public void setSessionId(String s)       { this.sessionId = s; }

    public String getCreatedBy()             { return createdBy; }
    public void setCreatedBy(String s)       { this.createdBy = s; }

    public LocalDateTime getCreatedAt()      { return createdAt; }
    public void setCreatedAt(LocalDateTime d){ this.createdAt = d; }

    public LocalDateTime getUpdatedAt()      { return updatedAt; }
    public void setUpdatedAt(LocalDateTime d){ this.updatedAt = d; }

    public LocalDateTime getClosedAt()       { return closedAt; }
    public void setClosedAt(LocalDateTime d) { this.closedAt = d; }
}