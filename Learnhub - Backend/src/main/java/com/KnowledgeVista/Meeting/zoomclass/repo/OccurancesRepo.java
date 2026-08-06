package  com.KnowledgeVista.Meeting.zoomclass.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import  com.KnowledgeVista.Meeting.zoomclass.Occurrences;


@Repository
public interface OccurancesRepo extends JpaRepository<Occurrences, Long> {
	 @Modifying
	   @Transactional
	    @Query("DELETE FROM Occurrences o WHERE o.meeting.id = :meetingId")
	 void deleteByMeetingId(Long meetingId);
}
