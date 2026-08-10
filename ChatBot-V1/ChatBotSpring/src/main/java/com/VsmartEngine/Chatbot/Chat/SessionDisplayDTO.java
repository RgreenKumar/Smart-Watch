package com.VsmartEngine.Chatbot.Chat;

public class SessionDisplayDTO {
	
	private String username;
	private String useremail;
	private long TotalMessage;
	private String Agents;
	private boolean status;
	private String time;
	
	public SessionDisplayDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public SessionDisplayDTO(String username, String useremail, long totalMessage, String agents, boolean status,
			String time) {
		super();
		this.username = username;
		this.useremail = useremail;
		TotalMessage = totalMessage;
		Agents = agents;
		this.status = status;
		this.time = time;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getUseremail() {
		return useremail;
	}
	
	public void setUseremail(String useremail) {
		this.useremail = useremail;
	}
	
	public long getTotalMessage() {
		return TotalMessage;
	}
	
	public void setTotalMessage(long totalMessage) {
		TotalMessage = totalMessage;
	}
	
	public String getAgents() {
		return Agents;
	}
	
	public void setAgents(String agents) {
		Agents = agents;
	}
	
	public boolean isStatus() {
		return status;
	}
	
	public void setStatus(boolean status) {
		this.status = status;
	}
	
	public String getTime() {
		return time;
	}
	
	public void setTime(String time) {
		this.time = time;
	}
	
}
