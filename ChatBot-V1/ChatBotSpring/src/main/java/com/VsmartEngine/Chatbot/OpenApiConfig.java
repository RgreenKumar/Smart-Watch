package com.VsmartEngine.Chatbot;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
	
	@Bean
	public GroupedOpenApi publicApi() {
		return GroupedOpenApi.builder().group("public").pathsToMatch("/chatbot/**") // Match all API paths
				.pathsToExclude("/chatbot/affliation") // Exclude specific path
				.build();
	}

}
