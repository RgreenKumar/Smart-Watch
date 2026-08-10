package com.VsmartEngine.Chatbot.Trigger;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TriggerTypeRepository extends JpaRepository<Triggertype,Long>{
	
	Optional<Triggertype> findByTriggerType(String triggerType);

}
