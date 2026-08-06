package  com.KnowledgeVista.User.Approvals;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import  com.KnowledgeVista.User.MuserDto;


public interface MuserApprovalPageable extends PagingAndSortingRepository<MuserApprovals, Long>{
	@Query("SELECT new  com.KnowledgeVista.User.MuserDto(u.userId, u.username, u.email, u.phone, u.isActive, u.dob, u.skills, u.institutionName, u.role.roleName) " +
		       "FROM MuserApprovals u")
		Page<MuserDto> findAllUsers(Pageable pageable);

@Query("SELECT new  com.KnowledgeVista.User.MuserDto(" +
	       "m.userId, " +
	       "m.username, " +
	       "m.email, " +
	       "m.phone, " +
	       "m.isActive, " +
	       "m.dob, " +
	       "m.skills," +  
	       "m.institutionName) " +
	       "FROM MuserApprovals m WHERE " +
	       "( (:username IS NULL OR LOWER(m.username) LIKE LOWER(CONCAT(:username, '%'))) AND " +
	       "(:email IS NULL OR LOWER(m.email) LIKE LOWER(CONCAT(:email, '%'))) AND " +
	       "(:phone IS NULL OR LOWER(m.phone) LIKE LOWER(CONCAT(:phone, '%'))) AND " +
	       "(:dob IS NULL OR m.dob = :dob) AND " +
	       "(m.institutionName =:institutionName) AND " +
	       "(:skills  IS NULL OR LOWER(m.skills) LIKE LOWER(CONCAT(:skills , '%'))) )")
	Page<MuserDto> CustomeApprovalsearchForAdmin(@Param("username") String username,
	                                   @Param("email") String email,
	                                   @Param("phone") String phone,
	                                   @Param("dob") LocalDate dob,
	                                   @Param("institutionName") String institutionName,
	                                   @Param("skills") String skills,
	                                   Pageable pageable);

}
