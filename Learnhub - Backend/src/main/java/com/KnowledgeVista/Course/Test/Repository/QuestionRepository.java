package  com.KnowledgeVista.Course.Test.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Course.Test.CourseTest;
import  com.KnowledgeVista.Course.Test.Question;

import jakarta.transaction.Transactional;

@Repository
public interface QuestionRepository extends JpaRepository<Question,Long> {
	  @Transactional
	    void deleteByTest(CourseTest test);
}
