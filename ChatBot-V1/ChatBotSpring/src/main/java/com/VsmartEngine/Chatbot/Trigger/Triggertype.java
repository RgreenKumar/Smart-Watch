package com.VsmartEngine.Chatbot.Trigger;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Triggertype {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "trigger_type", nullable = false)
	private String triggerType;

	public Triggertype() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Triggertype(long id, String triggerType) {
		super();
		this.id = id;
		this.triggerType = triggerType;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getTriggerType() {
		return triggerType;
	}

	public void setTriggerType(String triggerType) {
		this.triggerType = triggerType;
	}	    
	
}
