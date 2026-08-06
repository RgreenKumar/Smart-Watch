package  com.KnowledgeVista.SocialLogin;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SocialKeyRepo extends JpaRepository<SocialLoginKeys, Long> {
	 @Query("SELECT CASE WHEN EXISTS (SELECT 1 FROM SocialLoginKeys s WHERE s.institutionName = 'Meganartech') THEN true ELSE false END")
	    Boolean checkIfSysAdminExists();
	 
	@Query("SELECT s FROM SocialLoginKeys s WHERE "+
			 "		s.provider = :provider AND (s.institutionName = :institutionName OR s.institutionName IS NULL OR s.institutionName = 'Meganartech')")
	SocialLoginKeys findByInstitutionNameAndProvider(String institutionName,String provider);
	
	@Query("SELECT s.clientid FROM SocialLoginKeys s WHERE " +
		       "s.provider = :provider AND (s.institutionName = :institutionName OR s.institutionName IS NULL OR s.institutionName = 'Meganartech')")
		String findClientIdByInstitutionNameAndProvider(String institutionName, String provider);
	
	@Query("SELECT s FROM SocialLoginKeys s WHERE "+
			 "		s.provider = :provider AND s.institutionName = :institutionName")
	SocialLoginKeys findByInstitutionNameAndProviderforAdmin(String institutionName,String provider);
	
	@Query("SELECT u FROM SocialLoginKeys u WHERE u.institutionName = ?1")
	List<SocialLoginKeys>FindSocialLoginKeysByInstituiton(String institution);
}
