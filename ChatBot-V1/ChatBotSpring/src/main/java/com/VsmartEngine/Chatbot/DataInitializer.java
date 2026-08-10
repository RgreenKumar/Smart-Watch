package com.VsmartEngine.Chatbot;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.VsmartEngine.Chatbot.Admin.Role;
import com.VsmartEngine.Chatbot.Admin.RoleRepository;
import com.VsmartEngine.Chatbot.Trigger.TriggerTypeRepository;
import com.VsmartEngine.Chatbot.Trigger.Triggertype;

import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository rolerepository;
    
    @Autowired
    private TriggerTypeRepository triggerrepository;
    
    @Override
    public void run(String... args) {
        insertRoleIfNotExists("ADMIN");
        insertRoleIfNotExists("AGENT");
        insertTriggerIfNotExists("Basic");
    }

    private void insertRoleIfNotExists(String roleName) {
        rolerepository.findByRole(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setRole(roleName);
            return rolerepository.save(role);
        });
    }
    
    private void insertTriggerIfNotExists(String triggerType) {
    	triggerrepository.findByTriggerType(triggerType).orElseGet(() ->{
    		Triggertype trigger = new Triggertype();
    		trigger.setTriggerType(triggerType);
    		return triggerrepository.save(trigger);
    	});
    }

}
