package com.VsmartEngine.Chatbot.Departments;

import java.util.ArrayList;
import java.util.List;

import com.VsmartEngine.Chatbot.Admin.AdminRegister;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table
public class Department {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	
	@Column(name="depName")
	private String depName;
	
	@Column(name="description")
	private String description;
	
	@OneToMany(mappedBy = "department")
	@JsonManagedReference
	private List<AdminRegister> admins = new ArrayList<>();


	public Department() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public Department(long id, String depName, String description, List<AdminRegister> admins) {
		super();
		this.id = id;
		this.depName = depName;
		this.description = description;
		this.admins = admins;
	}
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
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

	public List<AdminRegister> getAdmins() {
		return admins;
	}

	public void setAdmins(List<AdminRegister> admins) {
		this.admins = admins;
	}

}


//@ManyToMany
//@JoinTable(
//  name = "department_admins",
//  joinColumns = @JoinColumn(name = "department_id"),
//  inverseJoinColumns = @JoinColumn(name = "admin_id")
//)
//@JsonManagedReference // This side will be serialized
//private List<AdminRegister> admins = new ArrayList<>();