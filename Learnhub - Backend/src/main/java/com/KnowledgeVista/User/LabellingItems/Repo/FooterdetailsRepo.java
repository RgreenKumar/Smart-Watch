package  com.KnowledgeVista.User.LabellingItems.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.User.LabellingItems.FooterDetails;

@Repository
public interface FooterdetailsRepo extends JpaRepository<FooterDetails, Long> {
    @Query("SELECT fd FROM FooterDetails fd WHERE fd.institutionName=:institutionName")
	Optional<FooterDetails>FindFooterDetailsByInstitution(String institutionName);
}
