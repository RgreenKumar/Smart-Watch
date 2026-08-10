package com.VsmartEngine.Chatbot.Chat;

import java.time.LocalDateTime;

public class MessageDisplay {
	
	private String sessionId;
    private boolean status;
    private Long departmentId;
    private Long userid;
    private String username;
    private String useremail;
    private String adminemail;
    private String message;
    private LocalDateTime timestamp;
    
    
	public MessageDisplay() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	

	public MessageDisplay(String sessionId, boolean status, Long departmentId, Long userid, String username,
			String useremail, String adminemail, String message, LocalDateTime timestamp) {
		super();
		this.sessionId = sessionId;
		this.status = status;
		this.departmentId = departmentId;
		this.userid = userid;
		this.username = username;
		this.useremail = useremail;
		this.adminemail = adminemail;
		this.message = message;
		this.timestamp = timestamp;
	}
	
	public Long getDepartmentId() {
		return departmentId;
	}

	public void setDepartmentId(Long departmentId) {
		this.departmentId = departmentId;
	}

	public String getSessionId() {
		return sessionId;
	}
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	public long getUserid() {
		return userid;
	}
	public void setUserid(long userid) {
		this.userid = userid;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public LocalDateTime getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
	public String getUseremail() {
		return useremail;
	}
	public void setUseremail(String useremail) {
		this.useremail = useremail;
	}
	public String getAdminemail() {
		return adminemail;
	}
	public void setAdminemail(String adminemail) {
		this.adminemail = adminemail;
	}



	public boolean isStatus() {
		return status;
	}



	public void setStatus(boolean status) {
		this.status = status;
	}



	public String getMessage() {
		return message;
	}



	public void setMessage(String message) {
		this.message = message;
	}



	public void setUserid(Long userid) {
		this.userid = userid;
	}
	

}
