package  com.KnowledgeVista.Meeting.zoomclass.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Meeting.zoomclass.ZoomMeetingInvitee;


@Repository
public interface InviteeRepo extends JpaRepository<ZoomMeetingInvitee, Long> {

	  @Query("SELECT u FROM ZoomMeetingInvitee u WHERE u.email = ?1")
   List<ZoomMeetingInvitee>findByEmail(String email);

}
