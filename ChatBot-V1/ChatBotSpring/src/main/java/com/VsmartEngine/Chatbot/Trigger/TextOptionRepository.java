package com.VsmartEngine.Chatbot.Trigger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextOptionRepository extends JpaRepository<TextOption,Long>{

}
