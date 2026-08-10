package com.VsmartEngine.Chatbot.Compose;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComposeMessageRepository extends JpaRepository<ComposeMessage, Long>{
    List<ComposeMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
