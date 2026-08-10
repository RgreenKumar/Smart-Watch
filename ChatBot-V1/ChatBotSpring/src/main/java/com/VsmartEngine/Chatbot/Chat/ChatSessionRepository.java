package com.VsmartEngine.Chatbot.Chat;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findBySessionId(String sessionId);

    // ── Active (not soft-deleted) queries ────────────────────────────────────
    List<ChatSession> findByDepartment_IdAndDeletedFalse(Long departmentId);
    List<ChatSession> findByReceiverAndDeletedFalse(String receiver);
    List<ChatSession> findByDeletedFalse();

    // ── Soft-deleted (Trash) queries ──────────────────────────────────────────
    List<ChatSession> findByDeletedTrue();

    // ── Legacy (kept for compatibility, prefer the *AndDeletedFalse variants) ─
    List<ChatSession> findByDepartment_Id(Long departmentId);
    List<ChatSession> findByReceiver(String receiver);
    List<ChatSession> findByDepartment_IdAndReceiverIsNull(Long departmentId);
    List<ChatSession> findByClaimedBy_Id(Long agentId);
}