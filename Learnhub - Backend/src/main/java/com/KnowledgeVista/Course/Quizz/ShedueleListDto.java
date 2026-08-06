package  com.KnowledgeVista.Course.Quizz;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShedueleListDto {
	 private Long quizzId;
	 private String quizzName;
	  private Long lessonId;
	 private String Lessontitle;
	 private LocalDate QuizzDate;
		public ShedueleListDto(Long quizzId, String quizzName, Long lessonId, String lessontitle,
				LocalDate QuizzDate) {
			super();
			this.quizzId = quizzId;
			this.quizzName = quizzName;
			this.lessonId = lessonId;
			this.Lessontitle = lessontitle;
			this.QuizzDate=QuizzDate;
		}
		
}
