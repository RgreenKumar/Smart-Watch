package com.VsmartEngine.Chatbot.Departments;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department,Long>{

	List<Department> findAllByOrderByIdAsc();

}
