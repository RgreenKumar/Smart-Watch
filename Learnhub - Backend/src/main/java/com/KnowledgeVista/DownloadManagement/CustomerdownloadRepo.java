package  com.KnowledgeVista.DownloadManagement;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerdownloadRepo extends JpaRepository<Customer_downloads, Long> {

	@Query("SELECT u FROM Customer_downloads u WHERE u.email = ?1")
	  Optional<Customer_downloads> findByEmail(String email);
}
