package com.VsmartEngine.Chatbot.Ticket;

import java.util.List;

public class TicketDetailDTO {

    public Ticket              ticket;
    public List<TicketMessage> messages;

    public TicketDetailDTO() {}

    public TicketDetailDTO(Ticket t, List<TicketMessage> msgs) {
        this.ticket   = t;
        this.messages = msgs;
    }
}