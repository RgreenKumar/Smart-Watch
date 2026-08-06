package  com.KnowledgeVista.User.LabellingItems.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.User.LabellingItems.Labelingitems;

@Repository
public interface LabellingitemsRepo extends JpaRepository<Labelingitems, Long> {
	
	@Query("SELECT li FROM Labelingitems li WHERE li.institutionName=:institutionName")
	Optional<Labelingitems>FindbyInstitution(String institutionName);

}
