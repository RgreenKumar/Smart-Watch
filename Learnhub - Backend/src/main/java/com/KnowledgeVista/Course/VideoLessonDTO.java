package  com.KnowledgeVista.Course;

import java.util.List;

import  com.KnowledgeVista.Course.moduleTest.ModuleTest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public  class VideoLessonDTO {
    private Long lessonId;
    private String lessonTitle;

//Define another class in the same file (must not be public)
@Getter
@Setter
@AllArgsConstructor
public static class SaveModuleTestRequest {
 private ModuleTest moduleTest;
 private List<Long> lessonIds;
 private Long courseId;
}
}
