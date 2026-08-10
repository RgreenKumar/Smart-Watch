package com.VsmartEngine.Chatbot.Admin;

import com.VsmartEngine.Chatbot.Departments.Department;

public class AdminUserDto {
	
	 private Long id;
	 private String username;
	 private Department department;
	 
	public AdminUserDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public AdminUserDto(Long id, String username, Department department) {
		super();
		this.id = id;
		this.username = username;
		this.department = department;
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

	public Department getDepartment() {
		return department;
	}

	public void setDepartment(Department department) {
		this.department = department;
	}
	
	

}
