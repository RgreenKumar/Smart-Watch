package  com.KnowledgeVista.Batch.Assignment.Repo;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.Assignment.Submission;

@Repository
public interface SubmissionRepo extends JpaRepository<Submission, Long> {
	@Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.batch.id=:batchId AND s.user.userId = :userId ")
	Optional<Submission> findByBatchIdAndAssignmentIdAndUserId(@Param("assignmentId") Long assignmentId,
			@Param("userId") Long userId, @Param("batchId") Long batchId);

	@Query(value = "SELECT s.id AS submissionId, s.submitted_at AS submittedAt, s.submission_status AS submissionStatus, "
			+ "s.is_graded AS isGraded, s.total_marks_obtained AS totalMarksObtained, s.feedback "
			+ "FROM submission s "
			+ "WHERE s.assignment_id = :assignmentId AND s.batch_id = :batchId AND s.user_id = :userId AND s.is_graded = false", nativeQuery = true)
	List<Map<String, Object>> getSubmissionDetailsAsMap(@Param("assignmentId") Long assignmentId,
			@Param("userId") Long userId, @Param("batchId") Long batchId);

	@Query(value = "SELECT question_id, answer_text FROM submission_answers WHERE submission_id = :submissionId", nativeQuery = true)
	List<Map<String, Object>> getAnswersForSubmission(@Param("submissionId") Long submissionId);

}
