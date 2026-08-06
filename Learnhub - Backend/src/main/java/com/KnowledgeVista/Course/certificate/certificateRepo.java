package  com.KnowledgeVista.Course.certificate;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface certificateRepo extends JpaRepository<certificate, Long> {

	@Query("SELECT c FROM certificate c WHERE c.institution = :institution")
	Optional<certificate> findByInstitution(@Param("institution") String institution);
	
	@Query("SELECT c FROM certificate c WHERE c.certificateId = :certificateId AND c.institution = :institution")
	Optional<certificate> findByIdAndInstitution(@Param("certificateId") Long certificateId, @Param("institution") String institution);



}
