package  com.KnowledgeVista.Meeting.zoomclass;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table
@Getter
@Setter@NoArgsConstructor
public class ZoomSettings {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long settingId;
	  private String audio;
	  private String autoRecording;
	  private boolean emailNotification;
	  private boolean hostVideo;
	  private boolean joinBeforeHost;
	  private Boolean waitingRoom ;
	

@OneToMany(mappedBy = "zoomSettings", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<ZoomMeetingInvitee> meetingInvitees;
        private boolean muteUponEntry;
        private boolean participantVideo;
        private boolean pushChangeToCalendar;
		@Override
		public String toString() {
			return "ZoomSettings [settingId=" + settingId + ", audio=" + audio + ", autoRecording=" + autoRecording
					+ ", emailNotification=" + emailNotification + ", hostVideo=" + hostVideo + ", joinBeforeHost="
					+ joinBeforeHost + ", meetingInvitees=" + meetingInvitees + ", muteUponEntry=" + muteUponEntry
					+ ", participantVideo=" + participantVideo + ", pushChangeToCalendar=" + pushChangeToCalendar + "]";
		}
        
}
