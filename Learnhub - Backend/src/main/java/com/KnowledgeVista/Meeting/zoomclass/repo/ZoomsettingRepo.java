package  com.KnowledgeVista.Meeting.zoomclass.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Meeting.zoomclass.ZoomSettings;

@Repository
public interface ZoomsettingRepo extends JpaRepository<ZoomSettings, Long> {

}
