package com.VsmartEngine.Chatbot.Chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
	List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);
    ChatMessage findTopBySessionIdOrderByTimestampDesc(String sessionId);
    long countBySessionId(String sessionId);
	void deleteBySessionId(String sessionId);  
}
