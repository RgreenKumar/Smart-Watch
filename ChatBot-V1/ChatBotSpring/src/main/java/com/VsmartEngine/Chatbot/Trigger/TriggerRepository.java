package com.VsmartEngine.Chatbot.Trigger;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.VsmartEngine.Chatbot.Admin.AdminRegister;

@Repository
public interface TriggerRepository extends JpaRepository<Trigger,Long>{
	
	List<Trigger> findAllByOrderByTriggeridAsc();
	
	 // Find Trigger by TriggerType
    Optional<Trigger> findByTriggerType(Triggertype triggerType);
    
    Optional<Trigger> findByTriggerType_TriggerType(String triggerType);
    
    Optional<Trigger> findByStatusTrue();
 
    List<Trigger> findAllByTriggerType_TriggerType(String triggerType);
    
    @Modifying
    @Query("UPDATE Trigger t SET t.status = false WHERE t.id <> :triggerId")
    void updateAllStatusesToFalseExcept(@Param("triggerId") Long triggerId);






}
