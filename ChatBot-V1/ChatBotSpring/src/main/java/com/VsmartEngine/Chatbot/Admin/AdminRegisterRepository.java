package com.VsmartEngine.Chatbot.Admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.VsmartEngine.Chatbot.Departments.Department;

@Repository
public interface AdminRegisterRepository extends JpaRepository<AdminRegister,Long>{
	
	Optional<AdminRegister> findByEmail(String email);
	
	Optional<AdminRegister> findByCode(String code);
	
	@Query("SELECT new com.VsmartEngine.Chatbot.Admin.AdminUserDto(a.id, a.username, d) FROM AdminRegister a LEFT JOIN a.department d WHERE a.status = true")
	List<AdminUserDto> findAllUserIdAndUsernameAndDepartment();
	
	List<AdminRegister> findAllByOrderByIdAsc();
	
	@Query("SELECT COUNT(a) > 0 FROM AdminRegister a WHERE a.role.role = 'ADMIN'")
	boolean existsAdminByRole();
	
	long countByRole_Role(String roleName);
	
	List<AdminRegister> findByDepartmentId(Long departmentId);	
	
}
