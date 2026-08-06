package  com.KnowledgeVista.Course.Test;


import jakarta.persistence.Column;
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
@Getter@Setter@NoArgsConstructor
public class Question {
  
	
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private long questionId;
	    
	    @Column(length = 1000)
	    private String questionText;
	    
	    private String option1;
	    private String option2;
	    private String option3;
	    private String option4;
	    private String answer;
	    
	    @ManyToOne
	    @JoinColumn(name = "testId", referencedColumnName = "testId", nullable = false)
	    private CourseTest test;
	    
	   
}
