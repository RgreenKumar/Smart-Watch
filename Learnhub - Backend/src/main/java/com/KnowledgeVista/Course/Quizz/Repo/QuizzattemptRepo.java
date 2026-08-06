package  com.KnowledgeVista.Course.Quizz.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Course.Quizz.QuizAttempt;
import  com.KnowledgeVista.Course.Quizz.DTO.QScoreNameIdDto;

import jakarta.transaction.Transactional;

@Repository
public interface QuizzattemptRepo extends JpaRepository<QuizAttempt, Long> {
	
	@Query("SELECT q FROM QuizAttempt q WHERE q.user.userId=:userId AND q.quiz.quizzId=:quizzId")
	Optional<QuizAttempt>findbyquizzIdandUserId(Long userId,Long quizzId);
	@Modifying
	@Transactional
	@Query("DELETE FROM QuizAttempt q WHERE q.quiz.quizzId=:quizzId ")
	void deleteByQuizzId(Long quizzId);
	
    @Query("SELECT COALESCE(SUM(qa.score), 0) FROM QuizAttempt qa " +
            "WHERE qa.user.id = :userId AND qa.quiz.id IN :quizIds")
     Double getTotalScoreForUser(@Param("userId") Long userId, @Param("quizIds") List<Long> quizIds);
    
    @Query("SELECT COALESCE(SUM(qa.score), 0) FROM QuizAttempt qa " +
            "WHERE qa.user.email = :email AND qa.quiz.id IN :quizIds")
     Double getTotalScoreForUser(@Param("email") String email, @Param("quizIds") List<Long> quizIds);
    
    @Query("SELECT new  com.KnowledgeVista.Course.Quizz.DTO.QScoreNameIdDto(qa.quiz.quizzId, qa.quiz.quizzName, qa.score) " +
            "FROM QuizAttempt qa " +
            "WHERE qa.user.email = :email AND qa.quiz.quizzId IN :quizIds")
     List<QScoreNameIdDto> getScoresDtoListForUser(@Param("email") String email, @Param("quizIds") List<Long> quizIds);

}
