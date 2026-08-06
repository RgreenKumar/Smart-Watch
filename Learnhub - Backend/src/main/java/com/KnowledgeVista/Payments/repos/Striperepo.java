package  com.KnowledgeVista.Payments.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import  com.KnowledgeVista.Payments.Stripesettings;

public interface Striperepo extends JpaRepository<Stripesettings, Long> {
	@Query("SELECT u FROM Stripesettings u WHERE u.institution_name = ?1")
	Optional<Stripesettings>findByinstitutionName(String institutionName);
	@Query("SELECT u.stripe_publish_key FROM Stripesettings u WHERE u.institution_name = ?1")
	String findpublishkeybyinstitution(String institutionName);

}
