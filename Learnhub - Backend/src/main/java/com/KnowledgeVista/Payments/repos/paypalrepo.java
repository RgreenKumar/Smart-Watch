package  com.KnowledgeVista.Payments.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Payments.Paypalsettings;

@Repository
public interface paypalrepo extends JpaRepository<Paypalsettings, Long> {

	@Query("SELECT p FROM Paypalsettings p WHERE p.institutionName=:institutionName")
	Optional<Paypalsettings>FindByInstitutionName(String institutionName);
}
