package  com.KnowledgeVista.Course.Quizz;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class QuizAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false) // Foreign key to QuizAttempt
    private QuizAttempt quizAttempt;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false ) // Foreign key to Quizzquestion
    private Quizzquestion question;

    private String selectedOption; // Stores the user's selected answer

    private Boolean isCorrect; // Stores whether the answer was correct
}
