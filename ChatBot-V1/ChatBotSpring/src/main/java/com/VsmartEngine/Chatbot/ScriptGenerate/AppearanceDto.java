package com.VsmartEngine.Chatbot.ScriptGenerate;

import java.util.List;
import java.util.UUID;

public class AppearanceDto {
	
	 private UUID id;	
	 private String propertyName;
	 private String websiteURL;
	 private String widgetScript;
	 private String buttonColor;
	 private String language;
	 private String heading;
	 private String textArea;
	 private String logoAlign;
	 private String headingAlign;
	 private String textAlign;
	 private String logoBase64;  // base64 string of image
	 private List<String> appearence;
	 
	 public AppearanceDto() {
	 	super();
	 	// TODO Auto-generated constructor stub
	 }
	 
	public AppearanceDto(UUID id, String propertyName, String websiteURL, String widgetScript, String buttonColor,
			String language, String heading, String textArea, String logoAlign, String headingAlign, String textAlign,
			String logoBase64, List<String> appearence) {
		super();
		this.id = id;
		this.propertyName = propertyName;
		this.websiteURL = websiteURL;
		this.widgetScript = widgetScript;
		this.buttonColor = buttonColor;
		this.language = language;
		this.heading = heading;
		this.textArea = textArea;
		this.logoAlign = logoAlign;
		this.headingAlign = headingAlign;
		this.textAlign = textAlign;
		this.logoBase64 = logoBase64;
		this.appearence = appearence;
	}
	
	public UUID getId() {
		return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}

	public String getLanguage() {
		return language;
	}
	public void setLanguage(String language) {
		this.language = language;
	}
	public String getHeading() {
		return heading;
	}
	public void setHeading(String heading) {
		this.heading = heading;
	}
	public String getTextArea() {
		return textArea;
	}
	public void setTextArea(String textArea) {
		this.textArea = textArea;
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
		return textAlign;
	}
	public void setTextAlign(String textAlign) {
		this.textAlign = textAlign;
	}
	public String getLogoBase64() {
		return logoBase64;
	}
	public void setLogoBase64(String logoBase64) {
		this.logoBase64 = logoBase64;
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

	public List<String> getAppearence() {
		return appearence;
	}

	public void setAppearence(List<String> appearence) {
		this.appearence = appearence;
	}

}




