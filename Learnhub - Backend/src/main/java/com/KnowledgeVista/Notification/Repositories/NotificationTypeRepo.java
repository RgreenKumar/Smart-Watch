package  com.KnowledgeVista.Notification.Repositories;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Notification.NotificationType;

@Repository
public interface NotificationTypeRepo extends JpaRepository<NotificationType, Long> {
     Optional<NotificationType> findByType(String type);
}
