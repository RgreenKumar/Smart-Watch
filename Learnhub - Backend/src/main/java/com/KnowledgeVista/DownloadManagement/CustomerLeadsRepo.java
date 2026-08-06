package  com.KnowledgeVista.DownloadManagement;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerLeadsRepo extends JpaRepository<CustomerLeads, Long> {
	
	@Query("SELECT u FROM CustomerLeads u WHERE u.email = ?1")
	  Optional<CustomerLeads> findByEmail(String email);

}
