package  com.KnowledgeVista.Course.moduleTest.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Course.moduleTest.ModuleTestActivity;
@Repository
public interface ModuleTestActivityRepo extends JpaRepository<ModuleTestActivity, Long> {

	@Query("SELECT COUNT(a) FROM ModuleTestActivity a WHERE a.user.userId = :userId AND a.Mtest.mtestId=:mtestId")
	long countByUserAndTestId(@Param("userId") Long userId,@Param("mtestId") Long mtestId);
	
}
