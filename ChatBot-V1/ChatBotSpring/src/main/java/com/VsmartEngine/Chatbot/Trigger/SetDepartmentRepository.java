package com.VsmartEngine.Chatbot.Trigger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SetDepartmentRepository extends JpaRepository<SetDepartment,Long>{

}
