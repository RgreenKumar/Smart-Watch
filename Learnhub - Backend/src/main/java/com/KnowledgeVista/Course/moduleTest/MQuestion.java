package  com.KnowledgeVista.Course.moduleTest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Getter@Setter@NoArgsConstructor
@AllArgsConstructor
public class MQuestion {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long questionId;
	    
	    @Column(length = 1000)
	    private String questionText;
	    
	    private String option1;
	    private String option2;
	    private String option3;
	    private String option4;
	    private String answer;
	    
	    @ManyToOne
	    @JoinColumn(name = "mtestId", referencedColumnName = "mtestId", nullable = false)
	    private ModuleTest mtest;

		public MQuestion(Long questionId, String questionText, String option1, String option2, String option3,
				String option4) {
			super();
			this.questionId = questionId;
			this.questionText = questionText;
			this.option1 = option1;
			this.option2 = option2;
			this.option3 = option3;
			this.option4 = option4;
		}
		public MQuestion(Long questionId, String questionText, String option1, String option2, String option3,
				String option4, String answer) {
			super();
			this.questionId = questionId;
			this.questionText = questionText;
			this.option1 = option1;
			this.option2 = option2;
			this.option3 = option3;
			this.option4 = option4;
			this.answer = answer;
		}

		public MQuestion(String questionText, String option1, String option2, String option3, String option4,
				String answer, ModuleTest mtest) {
			super();
			this.questionText = questionText;
			this.option1 = option1;
			this.option2 = option2;
			this.option3 = option3;
			this.option4 = option4;
			this.answer = answer;
			this.mtest = mtest;
		}
}
