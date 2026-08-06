package  com.KnowledgeVista.Batch;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseDto {
	private Long courseId;
    private String courseName;

    public CourseDto(Long courseId, String courseName) {
        this.courseId = courseId;
        this.courseName = courseName;
    }
}
