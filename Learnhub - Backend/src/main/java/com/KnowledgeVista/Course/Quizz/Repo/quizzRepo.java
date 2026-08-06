package  com.KnowledgeVista.Course.Quizz.Repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import  com.KnowledgeVista.Course.Quizz.Quizz;
import  com.KnowledgeVista.Course.Quizz.ShedueleListDto;
import  com.KnowledgeVista.Course.Quizz.DTO.QuizzHistoryDto;

@Repository
public interface quizzRepo extends JpaRepository<Quizz, Long> {

	@Query("SELECT q.lessons.courseDetail.courseId FROM Quizz q WHERE q.quizzId=:quizzId")
	Long getCourseIDFromQuizzId(Long quizzId);

	@Query("SELECT COUNT(q) > 0 FROM Quizz q WHERE q.lessons.lessonId = :lessonID")
	boolean existsQuizzByLessonID(@Param("lessonID") Long lessonID);

	@Modifying
	@Transactional
	@Query("DELETE FROM Quizz q WHERE q.quizzId=:quizzId")
	void deleteQuizzById(@Param("quizzId") Long quizzId);

	@Query(value = """
			    SELECT
			        q.quizzId
			    FROM QuizzSchedule qs
			    JOIN Batch b ON qs.batch.batchId = b.batchId
			    JOIN Quizz q ON qs.quiz.quizzId = q.quizzId
			    LEFT JOIN QuizAttempt qa ON qs.quiz.quizzId = qa.quiz.quizzId
			        AND qa.user.email = :email
			    WHERE qs.quiz.quizzId IN (:quizzIds)
			    ORDER BY qs.QuizzDate DESC
			""")
	List<Long> getQuizzIDSheduledByUser(@Param("email") String email, @Param("quizzIds") List<Long> quizzIds);// return
																												// scheduled

	@Query(value = """
			    SELECT new  com.KnowledgeVista.Course.Quizz.DTO.QuizzHistoryDto(
			        q.quizzName,
			        q.quizzId,
			        qs.batch.id,
			        COALESCE(qa.score, 0),
			        qa.startedAt,
			        qa.submittedAt,
			        qs.QuizzDate,
			        qs.scheduleId,
			        (SELECT COUNT(qq) FROM Quizzquestion qq WHERE qq.quizz.quizzId = q.quizzId),
			        CASE
			            WHEN qa.attemptId IS NULL OR qa.attemptId NOT IN
			                (SELECT DISTINCT qaa.quizAttempt.attemptId FROM QuizAttemptAnswer qaa)
			            THEN 'ABSENT'
			            ELSE 'PRESENT'
			        END
			    )
			    FROM QuizzSchedule qs
			    JOIN Batch b ON qs.batch.batchId = b.batchId
			    JOIN Quizz q ON qs.quiz.quizzId = q.quizzId
			    LEFT JOIN QuizAttempt qa ON qs.quiz.quizzId = qa.quiz.quizzId
			        AND qa.user.email = :email
			    WHERE qs.quiz.quizzId IN (:quizzIds)
			    ORDER BY qs.QuizzDate DESC
			""")
	Page<QuizzHistoryDto> getUserQuizzHistoryByEmail(@Param("email") String email,
			@Param("quizzIds") List<Long> quizzIds, Pageable pageable);

	@Query("SELECT new  com.KnowledgeVista.Course.Quizz.ShedueleListDto(q.quizzId, q.quizzName, l.lessonId, l.Lessontitle, s.QuizzDate) "
			+ "FROM Quizz q " + "JOIN q.lessons l " + "JOIN l.courseDetail c " + "JOIN c.batches b "
			+ "LEFT JOIN q.schedules s " + // Left join to include NULL if no schedule exists
			"ON s.batch.id = :batchId " + // Ensure schedule belongs to the batch
			"WHERE c.courseId = :courseId " + "AND b.id = :batchId")
	List<ShedueleListDto> getQuizzShedulesByCourseIdAndBatchId(@Param("courseId") Long courseId,
			@Param("batchId") Long batchId);

}
