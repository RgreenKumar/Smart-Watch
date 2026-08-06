package  com.KnowledgeVista.Course;

import java.util.List;

import  com.KnowledgeVista.Batch.Batch;
import  com.KnowledgeVista.Batch.Assignment.Assignment;
import  com.KnowledgeVista.User.Muser;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class CourseDetail {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "courseId")
	private Long courseId;
	@Column(name = "courseName")
	private String courseName;
	@Column(name = "courseUrl")
	private String courseUrl;
	@Column(name = "courseDescription", length = 1000)
	private String courseDescription;
	@Column(name = "courseCategory")
	private String courseCategory;
	@OneToMany(mappedBy = "courseDetail", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Assignment> assignments;

//	    @Column(name="licenceType")
//	    private String licenceType;

	@Column(name = "amount")
	private Long amount;
	@Lob
	@Column(name = "courseImage", length = 1000000)
	private byte[] courseImage;

	@ManyToMany(mappedBy = "allotedCourses")
	private List<Muser> trainer;

	@ManyToMany(mappedBy = "courses")
	private List<Muser> users;

	@Column(name = "Duration")
	private Long Duration;

	@Column(name = "institution")
	private String institutionName;

	@Column(name = "Noofseats")
	private Long Noofseats;

	@OneToMany(mappedBy = "courseDetail")
	private List<videoLessons> videoLessons;

	@ManyToMany(mappedBy = "courses")
	private List<Batch> batches;

	public long getUserCount() {
		if (users != null) {
			return (long) users.size();
		} else {
			return 0L;
		}
	}

	public long getAvailableSeats() {
		long totalSeats = Noofseats != null ? Noofseats : 0L;
		long occupiedSeats = users != null ? users.size() : 0L;
		return totalSeats - occupiedSeats;
	}

	public CourseDetail(Long courseId, String courseName, String courseUrl, String courseDescription,
			String courseCategory, Long amount, byte[] courseImage,  Long Duration,
			String institutionName, Long Noofseats) {
		this.courseId = courseId;
		this.courseName = courseName;
		this.courseUrl = courseUrl;
		this.courseDescription = courseDescription;
		this.courseCategory = courseCategory;
		this.amount = amount;
		this.courseImage = courseImage;
		this.Duration = Duration;
		this.institutionName = institutionName;
		this.Noofseats = Noofseats;
	}

}
