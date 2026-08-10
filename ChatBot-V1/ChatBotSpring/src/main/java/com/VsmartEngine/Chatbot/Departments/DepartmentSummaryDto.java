package com.VsmartEngine.Chatbot.Departments;

public class DepartmentSummaryDto {
	
	private Long id;
	private String depName;
    private String description;
    private int memberCount;
	public DepartmentSummaryDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public DepartmentSummaryDto(Long id, String depName, String description, int memberCount) {
		super();
		this.id = id;
		this.depName = depName;
		this.description = description;
		this.memberCount = memberCount;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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
	public int getMemberCount() {
		return memberCount;
	}
	public void setMemberCount(int memberCount) {
		this.memberCount = memberCount;
	}
 
}
