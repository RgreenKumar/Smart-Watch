package com.VsmartEngine.Chatbot.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findAllByOrderByUpdatedAtDesc();

    List<Ticket> findByStatusOrderByUpdatedAtDesc(String status);

    List<Ticket> findByAssignedAgentOrderByUpdatedAtDesc(String agentEmail);

    List<Ticket> findByCustomerEmailOrderByUpdatedAtDesc(String email);

    List<Ticket> findBySessionIdOrderByUpdatedAtDesc(String sessionId);

    @Query("SELECT t FROM Ticket t WHERE " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.customerName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.customerEmail) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY t.updatedAt DESC")
    List<Ticket> search(String q);

    long countByStatus(String status);
}