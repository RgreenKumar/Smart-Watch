package  com.KnowledgeVista.Batch.Assignment.Repo;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.Assignment.Assignment;

@Repository
public interface AssignmentRepo extends JpaRepository<Assignment, Long> {
	@Query("""
			    SELECT
			        a.id AS id,
			        a.title AS title,
			        a.description AS description,
			        a.totalMarks AS totalMarks
			    FROM Assignment a
			    WHERE a.courseDetail.courseId = :courseId
			      AND a.courseDetail.institutionName = :institutionName
			""")
	List<Map<String, Object>> findAssignmentDetailsWithoutCourseAndQuestions(@Param("courseId") Long courseId,
			@Param("institutionName") String institutionName);

	@Query(value = "SELECT " + "a.id AS assignmentId, " + "a.title AS assignmentTitle, "
			+ "s.assignment_date AS assignmentDate " + "FROM assignment a "
			+ "JOIN course_detail c ON a.course_id = c.course_id "
			+ "LEFT JOIN assignment_schedule s ON s.assignment_id = a.id AND s.batch_id = :batchId "
			+ "WHERE c.course_id = :courseId", nativeQuery = true)
	List<Map<String, Object>> getAssignmentSchedulesByCourseIdAndBatchId(@Param("courseId") Long courseId,
			@Param("batchId") Long batchId);

	@Query(value = "SELECT " + "a.id AS assignmentId, " + "a.title AS assignmentTitle, "
			+ "cd.course_name AS courseName, " + "cd.course_id AS courseId, "
			+ "a.description AS assignmentDescription, " + "s.assignment_date AS assignmentDate, "
			+ "s.schedule_id AS scheduleId, " + "COALESCE(sub.submission_status, 'NOT_SUBMITTED') AS submissionStatus,"
			+ "sub.submitted_at AS submittedAt " + "FROM assignment a "
			+ "INNER JOIN assignment_schedule s ON s.assignment_id = a.id "
			+ "INNER JOIN course_detail cd ON cd.course_id = a.course_id " + // 👈 This is the added join
			"LEFT JOIN submission sub ON sub.assignment_id = a.id AND sub.batch_id = s.batch_id AND sub.user_id = :userId "
			+ "WHERE s.batch_id = :batchId", nativeQuery = true)
	List<Map<String, Object>> getAssignmentSchedulesByBatchIdAndUserId(@Param("batchId") Long batchId,
			@Param("userId") Long userId);

}
