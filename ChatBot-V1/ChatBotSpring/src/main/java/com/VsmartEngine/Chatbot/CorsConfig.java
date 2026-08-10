//package com.VsmartEngine.Chatbot;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//	
//	 @Value("${UserOrigin}")
//	 private String frontendOrigin;
//
//	 @Value("${AdminOrigin}")
//	 private String adminOrigin;
//
//	 @Override
//	 public void addCorsMappings(CorsRegistry registry) {
//	     registry.addMapping("/**")
//	             .allowedOrigins(frontendOrigin, adminOrigin)
//	             .allowedMethods("*")
//	             .allowedHeaders("*")
//	             .allowCredentials(true);
//	 }
//}

package com.VsmartEngine.Chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

//    @Value("${UserOrigin}")
//    private String frontendOrigins;
//
//    @Value("${AdminOrigin}")
//    private String adminOrigin;

//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        // Split UserOrigin by comma to handle multiple origins
//        String[] userOrigins = frontendOrigins.split(",");
//
//        // Log origins
//        System.out.println("User Origins: " + Arrays.toString(userOrigins));
//
//        // Combine userOrigins and adminOrigin into one array
//        String[] allowedOrigins = combineOrigins(userOrigins, adminOrigin);

        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOriginPatterns("*")   // allow all origins
                    .allowedMethods("*")          // allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
                    .allowedHeaders("*")          // allow all headers
                    .allowCredentials(true);      // allow cookies / Authorization headers
        }
//    }

    // Helper method to append one element to a string array
    private String[] combineOrigins(String[] origins, String additional) {
        String[] result = new String[origins.length + 1];
        System.arraycopy(origins, 0, result, 0, origins.length);
        result[origins.length] = additional;
        return result;
    }
}

