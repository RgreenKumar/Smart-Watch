package com.VsmartEngine.Chatbot.Departments;

import java.util.List;

public class DepartmentRequestDto {
	
	 private String depName;
	 private String description;
	 private List<Long> adminIds; // list of admin IDs
	
	public DepartmentRequestDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public DepartmentRequestDto(String depName, String description, List<Long> adminIds) {
		super();
		this.depName = depName;
		this.description = description;
		this.adminIds = adminIds;
	}
	

	public String getDepName() {
		return depName;
	}
	

	public void setDepName(String depName) {
		this.depName = depName;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public List<Long> getAdminIds() {
		return adminIds;
	}
	public void setAdminIds(List<Long> adminIds) {
		this.adminIds = adminIds;
	}
	 
	 

}
