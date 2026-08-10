package com.VsmartEngine.Chatbot.TokenGeneration;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import io.jsonwebtoken.JwtParser;

@Configuration
public class JwtUtil {
	
//	  @Value("${jwt.secret}")
//	    private String hexSecretKey;
//
//	    private SecretKey SECRET_KEY;
//
//	    @PostConstruct
//	    public void init() {
//	        this.SECRET_KEY = Keys.hmacShaKeyFor(hexToBytes(hexSecretKey));
//	    }
//
//	    public String generateToken(String email,String role) {
//	        return Jwts.builder()
//	                .subject(email)
//	                .claim(email, role)
//	                .issuedAt(new Date())
//	                .expiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiry
//	                .signWith(SECRET_KEY)
//	                .compact();
//	    }
//
//	    public String extractEmail(String token) {
//	        return Jwts.parser()
//	                .verifyWith(SECRET_KEY)
//	                .build()
//	                .parseSignedClaims(token)
//	                .getPayload()
//	                .getSubject();
//	    }
//
//	    // Convert HEX to byte array
//	    private static byte[] hexToBytes(String hexKey) {
//	        int len = hexKey.length();
//	        byte[] bytes = new byte[len / 2];
//	        for (int i = 0; i < len; i += 2) {
//	            bytes[i / 2] = (byte) ((Character.digit(hexKey.charAt(i), 16) << 4)
//	                    + Character.digit(hexKey.charAt(i + 1), 16));
//	        }
//	        return bytes;
//	    }

    @Autowired
    private JwtConfig jwtConfig;

    public static final long JWT_EXPIRATION_MS = 86400000;
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private JwtParser getParser() {
        return Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getSecretKey().getBytes(StandardCharsets.UTF_8))
                .build();
    }

    public String generateToken(String username, Long id,String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        return Jwts.builder()
                .setSubject(username)
                .claim("username", username)
                .claim("id",id)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, jwtConfig.getSecretKey().getBytes(StandardCharsets.UTF_8))
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            getParser().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            return false;
        }
    }
    
//    public boolean validateToken(String token) {
//        try {
//            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
//            return true;
//        } catch (Exception e) {
//            return false;
//        }
//    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = getParser().parseClaimsJws(token).getBody();
            return claims.get("username", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract username from token", e);
            return null;
        }
    }
    
    public Integer getUserIdFromToken(String token) {
    	try {
    		Claims claims = getParser().parseClaimsJws(token).getBody();
            return claims.get("id", Integer.class);
    	}
    	catch (Exception e) {
            logger.error("Failed to extract id from token", e);
            return null;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            Claims claims = getParser().parseClaimsJws(token).getBody();
            return claims.get("username", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract email from token", e);
            return null;
        }
    }
    
   

    public String getRoleFromToken(String token) {
        try {
            Claims claims = getParser().parseClaimsJws(token).getBody();
            return claims.get("role", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract role from token", e);
            return null;
        }
    }
}
