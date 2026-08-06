package  com.KnowledgeVista.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LessonQuizDTO {
    private Long lessonId;
    private String lessonTitle;
    private Long quizzId;
    private String quizzName;
    
}

