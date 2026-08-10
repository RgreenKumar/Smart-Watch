package com.VsmartEngine.Chatbot.Chat;

public class MessageDTO {
	
	private String sessionId;
    private String sender;
    private String receiver;
    private String role;
    private String content;
	public MessageDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public MessageDTO(String sessionId, String sender, String receiver, String content, String role) {
		super();
		this.sessionId = sessionId;
		this.sender = sender;
		this.receiver = receiver;
		this.content = content;
		this.role = role;
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
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}

}
