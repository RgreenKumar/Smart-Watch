package  com.KnowledgeVista.Course.Quizz.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QuizzHistoryDto {
	private String quizzName;
	private Long quizzId;
	private Long batchId;
	private Double score;
	private LocalDateTime startedAt;
	private LocalDateTime submittedAt;
	private LocalDate quizzDate;
	private Long scheduleId;
	   private Long totalQuestions;
	private String status;
	public QuizzHistoryDto(String quizzName, Long quizzId, Long batchId, Double score, 
	                       LocalDateTime startedAt, LocalDateTime submittedAt, 
	                       LocalDate quizzDate, Long scheduleId,Long totalQuestions ,String status) {
		this.quizzName = quizzName;
		this.quizzId = quizzId;
		this.batchId = batchId;
		this.score = score;
		this.startedAt = startedAt;
		this.submittedAt = submittedAt;
		this.quizzDate = quizzDate;
		this.scheduleId = scheduleId;
		this.totalQuestions=totalQuestions;
		this.status=status;
	}
}
