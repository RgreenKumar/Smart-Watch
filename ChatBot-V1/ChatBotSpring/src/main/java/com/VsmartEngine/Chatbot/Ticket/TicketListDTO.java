package com.VsmartEngine.Chatbot.Ticket;

import java.time.LocalDateTime;

public class TicketListDTO {

    public Long          id;
    public String        subject;
    public String        customerName;
    public String        customerEmail;
    public String        status;
    public String        priority;
    public String        assignedAgent;
    public String        assignedAgentName;
    public String        tags;
    public String        source;
    public long          messageCount;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public TicketListDTO() {}

    public TicketListDTO(Ticket t, long msgCount) {
        this.id                = t.getId();
        this.subject           = t.getSubject();
        this.customerName      = t.getCustomerName();
        this.customerEmail     = t.getCustomerEmail();
        this.status            = t.getStatus();
        this.priority          = t.getPriority();
        this.assignedAgent     = t.getAssignedAgent();
        this.assignedAgentName = t.getAssignedAgentName();
        this.tags              = t.getTags();
        this.source            = t.getSource();
        this.messageCount      = msgCount;
        this.createdAt         = t.getCreatedAt();
        this.updatedAt         = t.getUpdatedAt();
    }
}