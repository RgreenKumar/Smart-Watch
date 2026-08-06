package  com.KnowledgeVista.Course.moduleTest;


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
public class ModuleTestAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mactivityId", nullable = false) // Corrected mapping to ModuleTestActivity
    private ModuleTestActivity moduletestActivity; 

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false) 
    private MQuestion question;

    private String selectedOption; // Stores the user's selected answer

    private Boolean isCorrect;
}
