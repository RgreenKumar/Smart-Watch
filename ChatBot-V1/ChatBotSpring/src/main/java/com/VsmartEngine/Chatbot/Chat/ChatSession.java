package com.VsmartEngine.Chatbot.Chat;

import java.time.LocalDateTime;

import com.VsmartEngine.Chatbot.Admin.AdminRegister;
import com.VsmartEngine.Chatbot.Departments.Department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table
public class ChatSession {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private String sender; // user email
    private String receiver; // agent email
    private boolean status;
    private LocalDateTime createdTime;
    
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "claimed_by")
    private AdminRegister claimedBy;

	public ChatSession() {
		super();
		// TODO Auto-generated constructor stub
	}

	public ChatSession(Long id, String sessionId, String sender, String receiver, boolean status,
			LocalDateTime createdTime, Department department, AdminRegister claimedBy) {
		super();
		this.id = id;
		this.sessionId = sessionId;
		this.sender = sender;
		this.receiver = receiver;
		this.status = status;
		this.createdTime = createdTime;
		this.department = department;
		this.claimedBy = claimedBy;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getSessionId() {
		return sessionId;
	}

	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public String getReceiver() {
		return receiver;
	}

	public void setReceiver(String receiver) {
		this.receiver = receiver;
	}

	public boolean isStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	public LocalDateTime getCreatedTime() {
		return createdTime;
	}

	public void setCreatedTime(LocalDateTime createdTime) {
		this.createdTime = createdTime;
	}

	public Department getDepartment() {
		return department;
	}

	public void setDepartment(Department department) {
		this.department = department;
	}

	public AdminRegister getClaimedBy() {
		return claimedBy;
	}

	public void setClaimedBy(AdminRegister claimedBy) {
		this.claimedBy = claimedBy;
	}
}
