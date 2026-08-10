package com.VsmartEngine.Chatbot.Compose;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComposeDraftRepository extends JpaRepository<ComposeDraft, Long> {
    List<ComposeDraft> findByAgentEmailOrderByUpdatedAtDesc(String agentEmail);
}
