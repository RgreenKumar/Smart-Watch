package com.VsmartEngine.Chatbot.Trigger;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table
public class Trigger {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long triggerid;
	
	private String name;

	private int delay;
	
	@ManyToOne
	@JoinColumn(name = "id")
	private Triggertype triggerType;
	
	@OneToOne(mappedBy = "trigger", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
    private TextOption textOption;
	
	
	@OneToMany(mappedBy = "trigger", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
    private List<SetDepartment> departments = new ArrayList<>();
	
	private List<String> firstTrigger;
	
	private boolean status;

	public Trigger() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Trigger(long triggerid, String name, int delay, Triggertype triggerType, TextOption textOption,
			List<SetDepartment> departments, List<String> firstTrigger, boolean status) {
		super();
		this.triggerid = triggerid;
		this.name = name;
		this.delay = delay;
		this.triggerType = triggerType;
		this.textOption = textOption;
		this.departments = departments;
		this.firstTrigger = firstTrigger;
		this.status = status;
	}

	public long getTriggerid() {
		return triggerid;
	}

	public void setTriggerid(long triggerid) {
		this.triggerid = triggerid;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getDelay() {
		return delay;
	}

	public void setDelay(int delay) {
		this.delay = delay;
	}

	public TextOption getTextOption() {
		return textOption;
	}

	public void setTextOption(TextOption textOption) {
		this.textOption = textOption;
	}

	public List<SetDepartment> getDepartments() {
		return departments;
	}

	public void setDepartments(List<SetDepartment> departments) {
		this.departments = departments;
	}

	public Triggertype getTriggerType() {
		return triggerType;
	}

	public void setTriggerType(Triggertype triggerType) {
		this.triggerType = triggerType;
	}

	public List<String> getFirstTrigger() {
		return firstTrigger;
	}

	public void setFirstTrigger(List<String> firstTrigger) {
		this.firstTrigger = firstTrigger;
	}

	public boolean isStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}
		
}
