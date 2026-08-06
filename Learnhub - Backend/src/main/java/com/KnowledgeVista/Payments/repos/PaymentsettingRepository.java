package  com.KnowledgeVista.Payments.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Payments.Paymentsettings;

@Repository
public interface PaymentsettingRepository extends JpaRepository<Paymentsettings, Long> {

	@Query("SELECT u FROM Paymentsettings u WHERE u.institutionName = ?1")
	Optional<Paymentsettings>findByinstitutionName(String institutionName);
}


