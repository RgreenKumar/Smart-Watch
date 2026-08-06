package  com.KnowledgeVista.Course.moduleTest;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import  com.KnowledgeVista.Course.CourseDetail;
import  com.KnowledgeVista.Course.videoLessons;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ModuleTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mtestId;

    @ManyToOne
    @JoinColumn(name = "courseId")
    @JsonIgnoreProperties("courseTests")
    private CourseDetail courseDetail;

    private String mtestName;
    private Long mnoOfQuestions;
    private Long mnoOfAttempt;
    private Double mpassPercentage;
	 @OneToMany(mappedBy = "mtest", cascade = CascadeType.ALL, fetch = FetchType.LAZY,orphanRemoval = true)
	    private List<SheduleModuleTest> schedules;
	@OneToMany(mappedBy = "mtest", cascade = CascadeType.ALL ,orphanRemoval = true)
    private List<MQuestion> questions;

    @ManyToMany
    @JoinTable(
        name = "moduletest_lessons",
        joinColumns = @JoinColumn(name = "mtest_id"),
        inverseJoinColumns = @JoinColumn(name = "lesson_id")
    )
    private List<videoLessons> lessons;
    

   

	public ModuleTest(Long mtestId, String mtestName, Long mnoOfQuestions, Long mnoOfAttempt, Double mpassPercentage) {
		super();
		this.mtestId = mtestId;
		this.mtestName = mtestName;
		this.mnoOfQuestions = mnoOfQuestions;
		this.mnoOfAttempt = mnoOfAttempt;
		this.mpassPercentage = mpassPercentage;
	}


}
