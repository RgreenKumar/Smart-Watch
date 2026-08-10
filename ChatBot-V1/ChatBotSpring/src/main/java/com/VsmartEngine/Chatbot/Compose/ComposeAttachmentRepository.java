package com.VsmartEngine.Chatbot.Compose;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComposeAttachmentRepository extends JpaRepository<ComposeAttachment, Long>{
    List<ComposeAttachment> findByConversationId(String conversationId);
    List<ComposeAttachment> findByMessageId(Long messageId);
}
