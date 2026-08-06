package  com.KnowledgeVista.Course.Test;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class TestHistoryDto {

	 private String courseName;
	 private Long courseId;
	    private String testName;
	    private Long testId;
	    private LocalDate testDate;
	    private Long nthAttempt;
	    private Double percentage;
	    private String status;
	    private String type;
	    
		public TestHistoryDto(String courseName, Long courseId, String testName, Long testId, LocalDate testDate,
				Long nthAttempt, Double percentage, String status, String type) {
			super();
			this.courseName = courseName;
			this.courseId = courseId;
			this.testName = testName;
			this.testId = testId;
			this.testDate = testDate;
			this.nthAttempt = nthAttempt;
			this.percentage = percentage;
			this.status = status;
			this.type=type;
		}
}
