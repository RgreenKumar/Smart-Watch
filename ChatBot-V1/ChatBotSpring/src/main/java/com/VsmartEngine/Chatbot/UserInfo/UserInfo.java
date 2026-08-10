package com.VsmartEngine.Chatbot.UserInfo;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class UserInfo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO) // Use AUTO to generate UUID
	private Long id;
	 
	private String username;
	
	@Column(unique = true)
	private String email;
	
	private String role;
	
	private String token;
	
	private LocalDateTime lastSeen;

	public UserInfo() {
		super();
		// TODO Auto-generated constructor stub
	}

	public UserInfo(Long id, String username, String email, String role, String token, LocalDateTime lastSeen) {
		super();
		this.id = id;
		this.username = username;
		this.email = email;
		this.role = role;
		this.token = token;
		this.lastSeen = lastSeen;
	}

	public UserInfo(String username, String email, String role) {
		super();
		this.username = username;
		this.email = email;
		this.role = role;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public LocalDateTime getLastSeen() {
		return lastSeen;
	}

	public void setLastSeen(LocalDateTime lastSeen) {
		this.lastSeen = lastSeen;
	}

}
