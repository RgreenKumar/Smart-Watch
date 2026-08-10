package com.VsmartEngine.Chatbot.Trigger;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table
public class TextOption {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;

	 private String text;

	 @OneToOne
	 @JoinColumn(name = "triggerid")
	 @JsonBackReference
	 private Trigger trigger;

	public TextOption() {
		super();
		// TODO Auto-generated constructor stub
	}

	public TextOption(Long id, String text, Trigger trigger) {
		super();
		this.id = id;
		this.text = text;
		this.trigger = trigger;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Trigger getTrigger() {
		return trigger;
	}

	public void setTrigger(Trigger trigger) {
		this.trigger = trigger;
	}
	 
	 

}
