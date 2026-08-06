package  com.KnowledgeVista.Course.Quizz;

import java.util.List;

import  com.KnowledgeVista.Course.videoLessons;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Getter@Setter@NoArgsConstructor
public class Quizz {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long quizzId;
	 private String quizzName;
	 private String instituionName;
	 private int durationInMinutes ;
 // e.g., 30 for 30 minutes
	  @OneToOne
	    @JoinColumn(name = "lessonId", referencedColumnName = "lessonId", unique = true) // Foreign key in Quizz table
	    private videoLessons lessons;
	 @OneToMany(mappedBy = "quizz", cascade = CascadeType.REMOVE,orphanRemoval = true)
	    private List<Quizzquestion> Quizzquestions;
	 
	 @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY,orphanRemoval = true)
	    private List<QuizzSchedule> schedules;
	 
	 @OneToMany(mappedBy = "quiz", cascade = CascadeType.REMOVE,fetch = FetchType.LAZY, orphanRemoval = true)
	    private List<QuizAttempt> quizAttempts;
}
