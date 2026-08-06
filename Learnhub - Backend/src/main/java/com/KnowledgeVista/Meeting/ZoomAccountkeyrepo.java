package  com.KnowledgeVista.Meeting;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ZoomAccountkeyrepo extends JpaRepository<ZoomAccountKeys, Long> {
	
	@Query("SELECT u FROM ZoomAccountKeys u WHERE u.institution_name=:institution_name")
	public Optional<ZoomAccountKeys>findbyInstitutionName(String institution_name);

}
