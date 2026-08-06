package  com.KnowledgeVista.Course.Test;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class MuserTestAnswer {
	  @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	   @ManyToOne
	    @JoinColumn(name = "activityId", nullable = false) // Foreign key to QuizAttempt
	    private MuserTestActivity testActivity;
	   @ManyToOne
	    @JoinColumn(name = "question_id", nullable = false ) // Foreign key to Quizzquestion
	    private Question question;

	    private String selectedOption; // Stores the user's selected answer

	    private Boolean isCorrect;
}
