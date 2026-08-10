package com.VsmartEngine.Chatbot.Chat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository repository;

    @Autowired
    private ChatSessionRepository chatsessionrepository;

    // ─────────────────────────────────────────────────────────────────────────
    // /app/send  — visitor or agent sends a chat message
    // ─────────────────────────────────────────────────────────────────────────
    @MessageMapping("/send")
    public void sendMessage(@Payload MessageDTO message) {
        ChatMessage saved = new ChatMessage();
        saved.setSessionId(message.getSessionId());
        saved.setSender(message.getSender());
        saved.setReceiver(message.getReceiver());
        saved.setContent(message.getContent());
        saved.setRole(message.getRole());
        saved.setTimestamp(LocalDateTime.now());
        repository.save(saved);

        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getSessionId(), message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /app/typing  — broadcast typing indicator to the session topic
    //
    // Payload (TypingDTO):
    //   { "sessionId": "abc-123", "sender": "user@email.com", "role": "USER" | "AGENT" }
    //
    // Broadcasts to: /topic/typing/{sessionId}
    //   { "role": "USER" | "AGENT", "typing": true/false }
    //
    // Both the chatbot widget (visitor) and the admin ThirdColumn subscribe to
    // /topic/typing/{sessionId} to show/hide the "Typing..." indicator.
    // ─────────────────────────────────────────────────────────────────────────
    @MessageMapping("/typing")
    public void broadcastTyping(@Payload TypingDTO payload) {
        messagingTemplate.convertAndSend(
                "/topic/typing/" + payload.getSessionId(),
                Map.of(
                        "role",      payload.getRole(),
                        "typing",    payload.isTyping(),
                        "sender",    payload.getSender() != null ? payload.getSender() : ""
                ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /app/session-claimed  — agent claimed a session (legacy, kept for compat)
    // ─────────────────────────────────────────────────────────────────────────
    @MessageMapping("/session-claimed")
    public void broadcastClaim(@Payload SessionClaimDTO payload) {
        messagingTemplate.convertAndSend(
                "/topic/session-claimed/" + payload.getDepartmentId(),
                Map.of("sessionId", payload.getSessionId()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /app/chat.takeover  — React / Flutter agent taps "Take Over"
    //
    // Steps:
    //  1. Mark session status = true (AGENT_ACTIVE) in DB
    //  2. Tell all other agents in this department to remove the session card
    //  3. Tell the visitor that a human agent has joined
    // ─────────────────────────────────────────────────────────────────────────
    @MessageMapping("/chat.takeover")
    public void agentTakeover(@Payload SessionClaimDTO payload) {

        // 1. Persist status change
        chatsessionrepository.findBySessionId(payload.getSessionId())
                .ifPresent(session -> {
                    session.setStatus(true);
                    chatsessionrepository.save(session);
                });

        // 2. Notify all agents in this department (remove the card from their list)
        messagingTemplate.convertAndSend(
                "/topic/session-claimed/" + payload.getDepartmentId(),
                Map.of(
                        "sessionId",  payload.getSessionId(),
                        "agentEmail", payload.getAgentEmail() != null
                                      ? payload.getAgentEmail() : ""
                ));

        // 3. Notify the visitor side (chatbot widget) that an agent has joined
        MessageDTO systemMsg = new MessageDTO();
        systemMsg.setSessionId(payload.getSessionId());
        systemMsg.setSender("SYSTEM");
        systemMsg.setReceiver("");
        systemMsg.setContent("A live agent has joined the conversation.");
        systemMsg.setRole("SYSTEM");

        messagingTemplate.convertAndSend(
                "/topic/messages/" + payload.getSessionId(), systemMsg);
    }
}