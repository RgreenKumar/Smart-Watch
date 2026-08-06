package  com.KnowledgeVista.Course.Test;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import  com.KnowledgeVista.Course.CourseDetail;
import  com.KnowledgeVista.Course.Quizz.QuizAttemptAnswer;
import  com.KnowledgeVista.User.Muser;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter@Setter@NoArgsConstructor
public class MuserTestActivity {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long activityId;

	   @ManyToOne
	    @JoinColumn(name = "userId")
	    private Muser user;
        @ManyToOne
        @JoinColumn(name="courseId")
        private CourseDetail course;
	    @ManyToOne 
	    @JoinColumn(name = "testId")
	    @JsonBackReference
	    private CourseTest test;
	    
	    private LocalDate testDate;
	    private Long nthAttempt;
	   
	    private Double percentage;
	    @OneToMany(mappedBy = "testActivity", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<MuserTestAnswer> answers;
}
