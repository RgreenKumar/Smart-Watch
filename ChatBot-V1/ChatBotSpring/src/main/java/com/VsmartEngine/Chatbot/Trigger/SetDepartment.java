package com.VsmartEngine.Chatbot.Trigger;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table
public class SetDepartment {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;

	 private String name;
	 
	 private Long DepId;

	 @ManyToOne
	 @JoinColumn(name = "triggerid")
	 @JsonBackReference
	 private Trigger trigger;

	public SetDepartment() {
		super();
		// TODO Auto-generated constructor stub
	}

	public SetDepartment(Long id, String name, Long depId, Trigger trigger) {
		super();
		this.id = id;
		this.name = name;
		DepId = depId;
		this.trigger = trigger;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Trigger getTrigger() {
		return trigger;
	}

	public void setTrigger(Trigger trigger) {
		this.trigger = trigger;
	}
	
	public Long getDepId() {
		return DepId;
	}

	public void setDepId(Long depId) {
		DepId = depId;
	}
	
}
