package  com.KnowledgeVista.Batch.Weightage;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Weightage {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;
	 @NotNull
	 @Min(0)
	 @Max(100)
	 private Integer passPercentage;
	 @NotNull
	 @Min(0)
	 @Max(100)
	 private Integer testWeightage;
	 @NotNull
	 @Min(0)
	 @Max(100)
	 private Integer quizzWeightage;
	 @NotNull
	 @Min(0)
	 @Max(100)
	 private Integer assignmentWeightage;
	 @NotNull
	 @Min(0)
	 @Max(100)
	 private Integer attendanceWeightage;
	 @Column(unique = true)
	 private String institutionName;
	 
	 public Weightage() {
	        this.assignmentWeightage = 5;
	        this.attendanceWeightage = 5;
	        this.passPercentage = 60;
	        this.quizzWeightage = 10;
	        this.testWeightage = 80;
	    }

	@Override
	public String toString() {
		return "Weightage [id=" + id + ", passPercentage=" + passPercentage + ", testWeightage=" + testWeightage
				+ ", quizzWeightage=" + quizzWeightage + ", assignmentWeightage=" + assignmentWeightage
				+ ", attendanceWeightage=" + attendanceWeightage + ", institutionName=" + institutionName + "]";
	}
	 
}
