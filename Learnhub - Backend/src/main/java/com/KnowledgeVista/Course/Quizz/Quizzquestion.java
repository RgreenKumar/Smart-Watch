package  com.KnowledgeVista.Course.Quizz;



import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
public class Quizzquestion {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private long questionId;
	    
	    @Column(length = 1000)
	    
	    private String questionText;
	    
	    private String option1;
	    private String option2;
	    private String option3;
	    private String option4;
	    private String answer;
	    
	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "quizzId", referencedColumnName = "quizzId", nullable = false)
	    private Quizz quizz;
	    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<QuizAttemptAnswer> quizAttemptAnswers;

	    public Quizzquestion(Long questionId, String questionText, String option1, String option2, String option3, String option4, String answer) {
	        this.questionId = questionId;
	        this.questionText = questionText;
	        this.option1 = option1;
	        this.option2 = option2;
	        this.option3 = option3;
	        this.option4 = option4;
	        this.answer = answer;
	    }
}
