package com.KnowledgeVista;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;



@SpringBootApplication
public class ElearningApplication extends SpringBootServletInitializer{

	public static void main(String[] args) {
		SpringApplication.run(ElearningApplication.class, args);
		
	}
	  @Override
	    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
	        return application.sources(ElearningApplication.class);
	    }

}
