package com.VsmartEngine.Chatbot.ScriptGenerate;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScriptGeneratorRepository extends JpaRepository<ScriptGenerate,UUID>{

	Optional<ScriptGenerate> findFirstByOrderByIdAsc();

}
