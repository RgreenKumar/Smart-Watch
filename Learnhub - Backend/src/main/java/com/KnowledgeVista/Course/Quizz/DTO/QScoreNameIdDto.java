package  com.KnowledgeVista.Course.Quizz.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QScoreNameIdDto {
	 private Long quizzId;
	 private String quizzName;
	 private Double score;
	public QScoreNameIdDto(Long quizzId, String quizzName, Double score) {
		super();
		this.quizzId = quizzId;
		this.quizzName = quizzName;
		this.score = score;
	}
}
