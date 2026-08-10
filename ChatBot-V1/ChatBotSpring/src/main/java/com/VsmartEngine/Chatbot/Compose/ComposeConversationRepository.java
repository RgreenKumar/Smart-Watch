package com.VsmartEngine.Chatbot.Compose;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComposeConversationRepository extends JpaRepository<ComposeConversation, Long>{
    Optional<ComposeConversation> findByConversationId(String conversationId);
    List<ComposeConversation> findByAgentEmailOrderByCreatedAtDesc(String agentEmail);
    List<ComposeConversation> findByStatusOrderByCreatedAtDesc(String status);
    List<ComposeConversation> findByAgentEmailAndStatusOrderByCreatedAtDesc(String agentEmail, String status);
}
