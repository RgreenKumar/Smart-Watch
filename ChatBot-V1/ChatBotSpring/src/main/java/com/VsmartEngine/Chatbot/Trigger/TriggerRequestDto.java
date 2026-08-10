package com.VsmartEngine.Chatbot.Trigger;

import java.util.List;

public class TriggerRequestDto {
	
	private String name;
    private int delay;
    private Long triggerTypeId;
    private String text; // Optional
    private List<Long> departmentIds; // IDs of selected departments
    private List<String> firstTrigger;
    private boolean status;
	public TriggerRequestDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	public TriggerRequestDto(String name, int delay, Long triggerTypeId, String text, List<Long> departmentIds,
			List<String> firstTrigger, boolean status) {
		super();
		this.name = name;
		this.delay = delay;
		this.triggerTypeId = triggerTypeId;
		this.text = text;
		this.departmentIds = departmentIds;
		this.firstTrigger = firstTrigger;
		this.status = status;
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
	public Long getTriggerTypeId() {
		return triggerTypeId;
	}
	public void setTriggerTypeId(Long triggerTypeId) {
		this.triggerTypeId = triggerTypeId;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public List<Long> getDepartmentIds() {
		return departmentIds;
	}
	public void setDepartmentIds(List<Long> departmentIds) {
		this.departmentIds = departmentIds;
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
