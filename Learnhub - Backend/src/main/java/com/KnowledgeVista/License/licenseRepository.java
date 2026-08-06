package  com.KnowledgeVista.License;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface licenseRepository extends JpaRepository<License, Long> {

	@Query("SELECT  u FROM License u WHERE u.institution = ?1")
	Optional<License> findByinstitution(String institution);
	
	@Query("SELECT  u.storagesize FROM License u WHERE u.institution = ?1")
	Long FindstoragesizeByinstitution(String institution);
	
	@Query("SELECT  u.course FROM License u WHERE u.institution = ?1")
	Long FindCourseCountByinstitution(String institution);
	
	@Query("SELECT  u.students FROM License u WHERE u.institution = ?1")
	Long FindStudentCountByinstitution(String institution);
	
	@Query("SELECT  u.trainer FROM License u WHERE u.institution = ?1")
	Long FindTrainerCountByinstitution(String institution);
	
}
