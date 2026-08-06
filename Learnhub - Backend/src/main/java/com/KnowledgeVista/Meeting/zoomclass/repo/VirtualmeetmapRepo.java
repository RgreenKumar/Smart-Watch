package  com.KnowledgeVista.Meeting.zoomclass.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Meeting.zoomclass.VirtualmeetingMap;

@Repository
public interface VirtualmeetmapRepo extends JpaRepository<VirtualmeetingMap, Long>{

	@Query("SELECT v FROM VirtualmeetingMap v WHERE v.institutionName=:institutionName")
	Optional<VirtualmeetingMap>findByinstitutionName(String institutionName);
	
	@Query("SELECT v.meeting.JoinUrl FROM VirtualmeetingMap v WHERE v.institutionName=:institutionName")
	String getJoinUrlByInstitutionName(String institutionName);
}
