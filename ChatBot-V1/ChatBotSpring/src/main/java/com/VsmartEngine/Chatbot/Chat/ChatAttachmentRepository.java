package com.VsmartEngine.Chatbot.Chat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, Long> {

    List<ChatAttachment> findBySessionIdOrderByCreatedAtDesc(String sessionId);
    List<ChatAttachment> findByMessageId(Long messageId);
}