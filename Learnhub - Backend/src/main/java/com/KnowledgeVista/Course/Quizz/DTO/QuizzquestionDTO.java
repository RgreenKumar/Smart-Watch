package  com.KnowledgeVista.Course.Quizz.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class QuizzquestionDTO {
    private Long questionId;
    private String questionText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
}
