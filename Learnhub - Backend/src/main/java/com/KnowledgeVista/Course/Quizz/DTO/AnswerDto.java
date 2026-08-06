package  com.KnowledgeVista.Course.Quizz.DTO;

import java.util.List;

import  com.KnowledgeVista.Course.Quizz.QuizAttemptAnswer;
import  com.KnowledgeVista.Course.moduleTest.ModuleTestAnswer;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnswerDto {
 private Long questionId;
 private String selected;
 



public static class QuizAnswerResult {
    private List<QuizAttemptAnswer> savedAnswers;
    private double score;
	public List<QuizAttemptAnswer> getSavedAnswers() {
		return savedAnswers;
	}
	public void setSavedAnswers(List<QuizAttemptAnswer> savedAnswers) {
		this.savedAnswers = savedAnswers;
	}
	public double getScore() {
		return score;
	}
	public void setScore(double score) {
		this.score = score;
	}
}
public static class ModuleTestAnswerResult {
    private List<ModuleTestAnswer> savedAnswers;
    private double score;
	public List<ModuleTestAnswer> getSavedAnswers() {
		return savedAnswers;
	}
	public void setSavedAnswers(List<ModuleTestAnswer> savedAnswers) {
		this.savedAnswers = savedAnswers;
	}
	public double getScore() {
		return score;
	}
	public void setScore(double score) {
		this.score = score;
	}
}

}
