package  com.KnowledgeVista.Course.Repository;

import java.util.Map;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.SearchDto;
import  com.KnowledgeVista.Course.CourseDetail;
import  com.KnowledgeVista.Course.CourseDetailDto;

@Repository
public interface CourseDetailRepository  extends JpaRepository<CourseDetail,Long>{
	//for alloted list
	@Query("SELECT new map(cd.courseId as courseId, cd.courseName as courseName) FROM CourseDetail cd WHERE cd.institutionName = :institutionName")
	List<Map<String, Object>> findAllCourseDetailsByInstitutionName(@Param("institutionName") String institutionName);
	//for alloted list
	@Query("SELECT new  com.KnowledgeVista.Course.CourseDetailDto(cd.courseId, cd.courseName, cd.courseUrl, cd.courseDescription, cd.courseCategory, cd.amount, cd.courseImage,  cd.Duration, cd.institutionName, cd.Noofseats) FROM CourseDetail cd WHERE cd.institutionName = :institutionName")
	List<CourseDetailDto> findAllByInstitutionNameDto(@Param("institutionName") String institutionName);
	@Query("SELECT new  com.KnowledgeVista.Course.CourseDetailDto(cd.courseId, cd.courseName, cd.courseUrl, cd.courseDescription, cd.courseCategory, cd.amount, cd.courseImage,  cd.Duration, cd.institutionName, cd.Noofseats) FROM CourseDetail cd ")
	List<CourseDetailDto>findallcoursevps();
	
	@Query("SELECT COUNT(cd) FROM CourseDetail cd WHERE cd.institutionName = :institutionName")
	Long countCourseByInstitutionName(@Param("institutionName") String institutionName);


    @Query("SELECT COUNT(cd) FROM CourseDetail cd WHERE cd.amount > 0 AND cd.institutionName = :institution")
    Long countPaidCoursesByInstitution(@Param("institution") String institution);
	 
	 @Query("SELECT cd FROM CourseDetail cd WHERE cd.id = :courseId AND cd.institutionName = :institutionName")
	 Optional<CourseDetail> findByCourseIdAndInstitutionName(@Param("courseId") Long courseId, @Param("institutionName") String institutionName);
	 
	 @Query("SELECT new  com.KnowledgeVista.Course.CourseDetail(cd.courseId, cd.courseName, cd.courseUrl, cd.courseDescription, " +
		       "cd.courseCategory, cd.amount, cd.courseImage,  cd.Duration, " +
		       "cd.institutionName, cd.Noofseats) " +
		       "FROM CourseDetail cd WHERE cd.courseId = :courseId AND cd.institutionName = :institutionName")
		Optional<CourseDetail> findMinimalCourseDetailbyCourseIdandInstitutionName(@Param("courseId") Long courseId, 
		                                               @Param("institutionName") String institutionName);


	 @Query("SELECT COALESCE(SUM(cd.Noofseats - SIZE(cd.users)), 0) FROM CourseDetail cd WHERE cd.institutionName = :institutionName")
	 Long countTotalAvailableSeats(@Param("institutionName") String institutionName);

	
	 @Query("SELECT c.courseId, c.courseName, c.amount " +
		       "FROM CourseDetail c " +
		       "WHERE (:courseName IS NOT NULL AND :courseName <> '' AND LOWER(c.courseName) LIKE LOWER(CONCAT('%', :courseName, '%'))) " +
		       "AND (:institutionName IS NOT NULL AND :institutionName <> '' AND LOWER(c.institutionName) LIKE LOWER(CONCAT('%', :institutionName, '%')))")
		List<Object[]> searchCourseIdAndNameByCourseNameByInstitution(
		    @Param("courseName") String courseName,
		    @Param("institutionName") String institutionName);


		@Query("SELECT u.email  " +
			       "FROM CourseDetail c " +
			       "JOIN c.users u " +
			       "WHERE c.courseId = :courseId")
		List<String> findInviteesByCourseId(@Param("courseId") Long courseId);

		@Query("SELECT u.email  " +
			       "FROM CourseDetail c " +
			       "JOIN c.trainer u " +
			       "WHERE c.courseId = :courseId")
			List<String> findTrainerInviteesByCourseId(@Param("courseId") Long courseId);


}
