package  com.KnowledgeVista.User.Repository;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import  com.KnowledgeVista.User.Muser;
import  com.KnowledgeVista.User.MuserDto;

public interface MuserRepoPageable extends PagingAndSortingRepository<Muser, Long> {
	 @Query("SELECT new  com.KnowledgeVista.User.MuserDto(u.userId, u.username, u.email, u.phone, u.isActive, u.dob, u.skills,u.institutionName) " +
	           "FROM Muser u WHERE u.role.roleName = :rolename")
	    Page<MuserDto> findByRoleName(@Param("rolename") String roleName, Pageable pageable);

	    @Query("SELECT new  com.KnowledgeVista.User.MuserDto(u.userId, u.username, u.email, u.phone, u.isActive, u.dob, u.skills,u.institutionName) " +
	           "FROM Muser u WHERE u.role.roleName = :rolename AND u.institutionName = :institutionname")
	    Page<MuserDto> findByRoleNameAndInstitutionName(@Param("rolename") String roleName, @Param("institutionname") String institutionName, Pageable pageable);

	    
	 @Query("SELECT new  com.KnowledgeVista.User.MuserDto(u2.userId, u2.username, u2.email, u2.phone, u2.isActive, u2.dob, u2.skills ,u2.institutionName) " +
	           "FROM Muser u1 " +
	           "JOIN u1.allotedCourses c " +
	           "JOIN c.users u2 " +
	           "WHERE u1.email = :email " +
	           "GROUP BY u2.userId, u2.username, u2.email, u2.phone, u2.isActive, u2.dob, u2.skills,u2.institutionName")
	    Page<MuserDto> findStudentsOfTrainer(@Param("email") String email, Pageable pageable);
	 @Query("SELECT new  com.KnowledgeVista.User.MuserDto(u2.userId, u2.username, u2.email, u2.phone, u2.isActive, u2.dob, u2.skills, u2.institutionName) " +
		       "FROM Muser u1 " +
		       "JOIN u1.allotedCourses c " +
		       "JOIN c.users u2 " +
		       "WHERE u1.email = :traineremail AND " +
		             "(:username IS NULL OR LOWER(u2.username) LIKE LOWER(CONCAT(:username, '%'))) AND " +
		             "(:email IS NULL OR LOWER(u2.email) LIKE LOWER(CONCAT(:email, '%'))) AND " +
		             "(:phone IS NULL OR LOWER(u2.phone) LIKE LOWER(CONCAT(:phone, '%'))) AND " +
		             "(:dob IS NULL OR u2.dob = :dob) AND " +
		             "(:skills IS NULL OR LOWER(u2.skills) LIKE LOWER(CONCAT(:skills, '%'))) " +
		       "GROUP BY u2.userId, u2.username, u2.email, u2.phone, u2.isActive, u2.dob, u2.skills, u2.institutionName")
		Page<MuserDto> searchStudentsOfTrainer(
		        @Param("traineremail") String traineremail,
		        @Param("username") String username,
		        @Param("email") String email,
		        @Param("phone") String phone,
		        @Param("dob") LocalDate dob,
		        @Param("skills") String skills,
		        Pageable pageable);
//================SYSADMIN===================
	 @Query("SELECT new  com.KnowledgeVista.User.MuserDto(" +
		       "m.userId, " +
		       "m.username, " +
		       "m.email, " +
		       "m.phone, " +
		       "m.isActive, " +
		       "m.dob, " +
		       "m.skills," +  
		       "m.institutionName) " +
		       "FROM Muser m WHERE " +
		       "( (:username IS NULL OR LOWER(m.username) LIKE LOWER(CONCAT(:username, '%'))) AND " +
		       "(:email IS NULL OR LOWER(m.email) LIKE LOWER(CONCAT(:email, '%'))) AND " +
		       "(:phone IS NULL OR LOWER(m.phone) LIKE LOWER(CONCAT(:phone, '%'))) AND " +
		       "(:dob IS NULL OR m.dob = :dob) AND " +
		       "(:institutionName IS NULL OR LOWER(m.institutionName) LIKE LOWER(CONCAT(:institutionName, '%'))) AND " +
		       "(m.role.roleName= :roleName) AND " +
		       "(:skills  IS NULL OR LOWER(m.skills) LIKE LOWER(CONCAT(:skills , '%'))) )")
		Page<MuserDto> CustomesearchUsers(@Param("username") String username,
		                                   @Param("email") String email,
		                                   @Param("phone") String phone,
		                                   @Param("dob") LocalDate dob,
		                                   @Param("institutionName") String institutionName,
		                                   @Param("roleName") String roleName,
		                                   @Param("skills") String skills,
		                                   Pageable pageable);
 
	 
//================SYSADMIN===================
//=============================AMDIN===============================

@Query("SELECT new  com.KnowledgeVista.User.MuserDto(" +
	       "m.userId, " +
	       "m.username, " +
	       "m.email, " +
	       "m.phone, " +
	       "m.isActive, " +
	       "m.dob, " +
	       "m.skills," +  
	       "m.institutionName) " +
	       "FROM Muser m WHERE " +
	       "( (:username IS NULL OR LOWER(m.username) LIKE LOWER(CONCAT(:username, '%'))) AND " +
	       "(:email IS NULL OR LOWER(m.email) LIKE LOWER(CONCAT(:email, '%'))) AND " +
	       "(:phone IS NULL OR LOWER(m.phone) LIKE LOWER(CONCAT(:phone, '%'))) AND " +
	       "(:dob IS NULL OR m.dob = :dob) AND " +
	       "(m.institutionName =:institutionName) AND " +
	       "(m.role.roleName= :roleName) AND " +
	       "(:skills  IS NULL OR LOWER(m.skills) LIKE LOWER(CONCAT(:skills , '%'))) )")
	Page<MuserDto> CustomesearchForAdmin(@Param("username") String username,
	                                   @Param("email") String email,
	                                   @Param("phone") String phone,
	                                   @Param("dob") LocalDate dob,
	                                   @Param("institutionName") String institutionName,
	                                   @Param("roleName") String roleName,
	                                   @Param("skills") String skills,
	                                   Pageable pageable);




}
