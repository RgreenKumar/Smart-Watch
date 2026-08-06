package  com.KnowledgeVista.Course.Test.Repository;


import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import  com.KnowledgeVista.Course.Test.CourseTest;
import  com.KnowledgeVista.Course.Test.MuserTestActivity;
import  com.KnowledgeVista.Course.Test.TestHistoryDto;
import  com.KnowledgeVista.User.Muser;

import jakarta.transaction.Transactional;

public interface MusertestactivityRepo extends JpaRepository<MuserTestActivity, Long> {
	
	List<MuserTestActivity> findByuser(Muser user); 
	
	@Query("SELECT COUNT(a) FROM MuserTestActivity a WHERE a.user.userId = :userId AND a.test.testId=:testId")
	long countByUserAndTestId(@Param("userId") Long userId,@Param("testId") Long testId);
	

	  @Transactional
	    void deleteByUser(Muser user);
	  
	  @Modifying
	  @Transactional
	  @Query("DELETE FROM MuserTestActivity act WHERE act.test = :test")
	  void deleteByCourseTest(CourseTest test);
	  
	  @Query("""
		SELECT	    COALESCE(SUM(total_percentage) / :count, 0.0) 
			    FROM (
			        SELECT mta.percentage AS total_percentage
			        FROM MuserTestActivity mta
			        WHERE mta.nthAttempt = (
			            SELECT MAX(mta2.nthAttempt)
			            FROM MuserTestActivity mta2
			            WHERE mta2.user.userId = mta.user.userId
			              AND mta2.test.testId = mta.test.testId
			        )
			        AND mta.user.email = :email
			        AND mta.test.testId IN :testIds

			        UNION ALL
			        SELECT mta2.percentage AS total_percentage 
			        FROM ModuleTestActivity mta2
			        WHERE mta2.nthAttempt = (
			            SELECT MAX(mta3.nthAttempt)
			            FROM ModuleTestActivity mta3
			            WHERE mta3.user.userId = mta2.user.userId
			              AND mta3.Mtest.mtestId = mta2.Mtest.mtestId
			        )
			        AND mta2.user.email = :email
			        AND mta2.Mtest.mtestId IN :mtestIds
			    ) combined
			""")
			Double getPercentageForUser(@Param("email") String email, 
			                            @Param("testIds") List<Long> testIds, 
			                            @Param("mtestIds") List<Long> mtestIds
			                            ,@Param("count") int count);



	  @Query("""
			    SELECT new  com.KnowledgeVista.Course.Test.TestHistoryDto(
			        t.courseDetail.courseName, 
			        t.courseDetail.courseId,
			        t.testName, 
			        t.testId, 
			        COALESCE(mta.testDate, NULL) AS testDate, 
			        COALESCE(mta.nthAttempt, 0) AS nthAttempt, 
			        COALESCE(mta.percentage, 0) AS percentage,
			        CASE 
			            WHEN mta.test.testId IS NULL THEN 'N/A' 
			            WHEN COALESCE(mta.percentage, 0) >= t.passPercentage THEN 'PASS' 
			            ELSE 'FAIL' 
			        END AS status
			    )
			    FROM CourseTest t
			    LEFT JOIN MuserTestActivity mta 
			        ON t.testId = mta.test.testId 
			        AND mta.user.email = :email
			    WHERE t.testId IN :testIds
			""")
			Page<TestHistoryDto> getTestHistoryByEmailAndTestIds(
			    @Param("email") String email, 
			    @Param("testIds") List<Long> testIds,
			    Pageable pageable
			);

	 }
