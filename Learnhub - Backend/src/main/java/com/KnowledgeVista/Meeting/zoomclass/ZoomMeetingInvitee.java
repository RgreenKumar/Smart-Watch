package  com.KnowledgeVista.Meeting.zoomclass;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table
@Getter
@Setter@NoArgsConstructor
public class ZoomMeetingInvitee {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long invId;
	 private String email;
	  @ManyToOne
	 private ZoomSettings zoomSettings;
	@Override
	public String toString() {
		return "ZoomMeetingInvitee [invId=" + invId + ", email=" + email + ", zoomSettings=" + zoomSettings + "]";
	}
	  
	  
}
