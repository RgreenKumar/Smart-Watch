package  com.KnowledgeVista.Course.Quizz;

import java.time.LocalDateTime;
import java.util.List;

import  com.KnowledgeVista.User.Muser;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class QuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attemptId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Foreign key to Muser
    private Muser user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false) // Foreign key to Quizz
    private Quizz quiz;

    private Integer attemptNumber; // Track multiple attempts by the same user

    private Double score; // Store score after submission


    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAttemptAnswer> answers;
    
   
}
