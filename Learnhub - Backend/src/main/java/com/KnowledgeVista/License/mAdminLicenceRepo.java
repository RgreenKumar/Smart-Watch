package  com.KnowledgeVista.License;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface mAdminLicenceRepo extends JpaRepository<Madmin_Licence, Long>{
	@Query("SELECT u FROM Madmin_Licence u WHERE u.institution=?1")
	Madmin_Licence findByInstitutionName(String institution);
	

}
