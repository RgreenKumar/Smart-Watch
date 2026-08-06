package  com.KnowledgeVista.Meeting.zoomclass;

import java.util.List;

import  com.KnowledgeVista.Attendance.Attendancedetails;
import  com.KnowledgeVista.Batch.Batch;
import  com.KnowledgeVista.Course.CourseDetail;
import  com.KnowledgeVista.User.Muser;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table
@Getter
@Setter@NoArgsConstructor
public class Meeting {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long pkId;
	 private Long notificationId;
	 @Column(unique = true)
	 private Long MeetingId;
	 private String uuid;
	 private String HostEmail;
	 @Column(length=1000)
	 private String startUrl;
	 @Column(length=1000)
	 private String JoinUrl;
	 private String Password;
	  private String agenda;
	  private Integer duration;
	  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	  private Recurrenceclass reccurance;
	  @OneToMany(cascade = CascadeType.ALL,fetch = FetchType.LAZY,orphanRemoval = true)
	    private List<Occurrences> occurances;
     @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	  private ZoomSettings settings;
	    private String startTime;
	    private String timezone;
	    private String topic;
	    private Integer type;
	    private String createdBy;
	    @ManyToMany(fetch = FetchType.LAZY)
	    @JoinTable(
	        name = "meeting_course_detail_mapping",
	        joinColumns = @JoinColumn(name = "meeting_id"),
	        inverseJoinColumns = @JoinColumn(name = "course_detail_id")
	    )
	    private List<CourseDetail> courseDetails;

	    @ManyToMany(fetch = FetchType.LAZY)
	    @JoinTable(
	        name = "meeting_user_mapping",
	        joinColumns = @JoinColumn(name = "meeting_id"),
	        inverseJoinColumns = @JoinColumn(name = "user_id")
	    )
	    private List<Muser> users;

	    @ManyToMany(fetch = FetchType.LAZY)
	    @JoinTable(
	        name = "meeting_batch_mapping",
	        joinColumns = @JoinColumn(name = "meeting_id"),
	        inverseJoinColumns = @JoinColumn(name = "batch_id")
	    )
	    private List<Batch> batches;

	    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	    private List<Attendancedetails> attendanceRecords;
	    
		@Override
		public String toString() {
			return "Meeting [pkId=" + pkId + ", MeetingId=" + MeetingId + ", uuid=" + uuid + ", HostEmail=" + HostEmail
					+ ", startUrl=" + startUrl + ", JoinUrl=" + JoinUrl + ", Password=" + Password + ", agenda="
					+ agenda + ", duration=" + duration + ", settings=" + settings + ", startTime=" + startTime
					+ ", timezone=" + timezone + ", topic=" + topic + ", type=" + type + ", createdBy=" + createdBy
					+ "]";
		}
	    
	
}
