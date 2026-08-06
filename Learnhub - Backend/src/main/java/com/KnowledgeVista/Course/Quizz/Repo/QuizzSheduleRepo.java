package  com.KnowledgeVista.Course.Quizz.Repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Course.Quizz.QuizzSchedule;

import jakarta.transaction.Transactional;
@Repository
public interface QuizzSheduleRepo extends JpaRepository<QuizzSchedule, Long>{
	
	@Query("SELECT q FROM QuizzSchedule q WHERE q.quiz.quizzId = :quizzId AND q.batch.batchId = :batchId")
	Optional<QuizzSchedule> findByQuizzIdAndBatchId(@Param("quizzId") Long quizzId, @Param("batchId") String batchId);
	
	@Query("SELECT q FROM QuizzSchedule q WHERE q.quiz.quizzId = :quizzId AND q.batch.id = :batchId")
	Optional<QuizzSchedule> findByQuizzIdAndBatchId(@Param("quizzId") Long quizzId, @Param("batchId") Long batchId);
	
	@Query("SELECT q.QuizzDate FROM QuizzSchedule q WHERE q.quiz.quizzId = :quizzId AND q.batch.id = :batchId")
	LocalDate getsheduleDate(@Param("quizzId") Long quizzId, @Param("batchId") Long batchId);
	
	@Modifying
	@Transactional
	@Query("DELETE FROM QuizzSchedule q WHERE q.quiz.quizzId = :quizzId ")
	void deleteByquizzID(@Param("quizzId") Long quizzId);
}
