package com.VsmartEngine.Chatbot.ScriptGenerate;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table
public class ScriptGenerate {
	
	  @Id
	    @GeneratedValue(strategy = GenerationType.AUTO) // Use AUTO to generate UUID
	    private UUID id;

	    @Column(unique = true, nullable = true)
	    private String propertyName;

	    @Column(unique = true, nullable = true)
	    private String websiteURL;

	    @Column(name = "widget_script", nullable = true)  // Make it nullable
	    private String widgetScript;

	    private String buttonColor;

	    private String Language;

	    @Lob
	    @Column(name = "Logo", length = 1000000)
	    @Basic(fetch = FetchType.EAGER)
	    private byte[] logo;

	    private String heading;

	    private String TextArea;

	    private String logoAlign; 
	    private String headingAlign;
	    private String TextAlign;
	    
	    private List<String> appearence;

	public ScriptGenerate() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public ScriptGenerate(UUID id, String propertyName, String websiteURL, String widgetScript, String buttonColor,
			String language, byte[] logo, String heading, String textArea, String logoAlign, String headingAlign,
			String textAlign, List<String> appearence) {
		super();
		this.id = id;
		this.propertyName = propertyName;
		this.websiteURL = websiteURL;
		this.widgetScript = widgetScript;
		this.buttonColor = buttonColor;
		Language = language;
		this.logo = logo;
		this.heading = heading;
		TextArea = textArea;
		this.logoAlign = logoAlign;
		this.headingAlign = headingAlign;
		TextAlign = textAlign;
		this.appearence = appearence;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getPropertyName() {
		return propertyName;
	}

	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	public String getWebsiteURL() {
		return websiteURL;
	}

	public void setWebsiteURL(String websiteURL) {
		this.websiteURL = websiteURL;
	}

	public String getWidgetScript() {
		return widgetScript;
	}

	public void setWidgetScript(String widgetScript) {
		this.widgetScript = widgetScript;
	}

	public String getButtonColor() {
		return buttonColor;
	}

	public void setButtonColor(String buttonColor) {
		this.buttonColor = buttonColor;
	}

	public String getLanguage() {
		return Language;
	}

	public void setLanguage(String language) {
		Language = language;
	}

	public byte[] getLogo() {
		return logo;
	}

	public void setLogo(byte[] logo) {
		this.logo = logo;
	}

	public String getHeading() {
		return heading;
	}

	public void setHeading(String heading) {
		this.heading = heading;
	}

	public String getTextArea() {
		return TextArea;
	}

	public void setTextArea(String textArea) {
		TextArea = textArea;
	}

	public String getLogoAlign() {
		return logoAlign;
	}

	public void setLogoAlign(String logoAlign) {
		this.logoAlign = logoAlign;
	}

	public String getHeadingAlign() {
		return headingAlign;
	}

	public void setHeadingAlign(String headingAlign) {
		this.headingAlign = headingAlign;
	}

	public String getTextAlign() {
		return TextAlign;
	}

	public void setTextAlign(String textAlign) {
		TextAlign = textAlign;
	}

	public List<String> getAppearence() {
		return appearence;
	}

	public void setAppearence(List<String> appearence) {
		this.appearence = appearence;
	}
	
}
