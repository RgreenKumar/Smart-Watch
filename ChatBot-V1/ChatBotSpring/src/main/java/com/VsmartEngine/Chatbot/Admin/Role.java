package com.VsmartEngine.Chatbot.Admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Role {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long role_id;
	
	@Column(nullable = false, unique = true)
    private String role;

	public Role() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Role(long role_id, String role) {
		super();
		this.role_id = role_id;
		this.role = role;
	}

	public long getRole_id() {
		return role_id;
	}

	public void setRole_id(long role_id) {
		this.role_id = role_id;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
	
	
	
	

}
