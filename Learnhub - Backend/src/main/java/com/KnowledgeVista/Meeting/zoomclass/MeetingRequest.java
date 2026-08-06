package  com.KnowledgeVista.Meeting.zoomclass;
import java.time.LocalDateTime;
import java.util.List;

import  com.KnowledgeVista.Batch.SearchDto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter @NoArgsConstructor
public class MeetingRequest {
    private String agenda;
//    private boolean defaultPassword;
    private Integer duration;
    private String password;
//    private boolean preSchedule;
   private Recurrence recurrence;
//    private String scheduleFor;
    private Settings settings;
    private LocalDateTime startTime;
    private String startingTime;
//    private String templateId;
    private String timezone;
    private String topic;
   
    private Integer type;

    // Getters and Setters for each field
  
    public static class Recurrence {
        private String endDateTime;
        private Integer endTimes;
        private Integer monthlyDay;
        private Integer monthlyWeek;
        private Integer monthlyWeekDay;
        private Integer repeatInterval;
        private Integer type;
        private String weeklyDays;
		public String getEndDateTime() {
			return endDateTime;
		}
		public void setEndDateTime(String endDateTime) {
			this.endDateTime = endDateTime;
		}
		public Integer getEndTimes() {
			return endTimes;
		}
		public void setEndTimes(Integer endTimes) {
			this.endTimes = endTimes;
		}
		public Integer getMonthlyDay() {
			return monthlyDay;
		}
		public void setMonthlyDay(int monthlyDay) {
			this.monthlyDay = monthlyDay;
		}
		public Integer getMonthlyWeek() {
			return monthlyWeek;
		}
		public void setMonthlyWeek(Integer monthlyWeek) {
			this.monthlyWeek = monthlyWeek;
		}
		public Integer getMonthlyWeekDay() {
			return monthlyWeekDay;
		}
		public void setMonthlyWeekDay(Integer monthlyWeekDay) {
			this.monthlyWeekDay = monthlyWeekDay;
		}
		public Integer getRepeatInterval() {
			return repeatInterval;
		}
		public void setRepeatInterval(Integer repeatInterval) {
			this.repeatInterval = repeatInterval;
		}
		public Integer getType() {
			return type;
		}
		public void setType(Integer type) {
			this.type = type;
		}
		public String getWeeklyDays() {
			return weeklyDays;
		}
		public void setWeeklyDays(String weeklyDays) {
			this.weeklyDays = weeklyDays;
		}
    }

    public static class Settings {
    	 private List<SearchDto> GroupinviteeDto;
public List<SearchDto> getGroupinviteeDto() {
			return GroupinviteeDto;
		}
		public void setGroupinviteeDto(List<SearchDto> groupinviteeDto) {
			GroupinviteeDto = groupinviteeDto;
		}
		//        private List<String> additionalDataCenterRegions;
//        private boolean allowMultipleDevices;
//        private String alternativeHosts;
//        private boolean alternativeHostsEmailNotification;
//        private Integer approvalType;
        private String audio;
//        private String audioConferenceInfo;
//        private String authenticationDomains;
//        private List<AuthenticationException> authenticationException;
//        private String authenticationOption;
        private String autoRecording;
//        private Integer calendarType;
//        private boolean closeRegistration;
//        private String contactEmail;
//        private String contactName;
        private boolean emailNotification;
//        private String encryptionType;
//        private boolean focusMode;
//        private List<String> globalDialInCountries; 

        private boolean hostVideo;
//        private Integer jbhTime;
        private boolean joinBeforeHost;
//        private boolean meetingAuthentication;
        private List<MeetingInvitee> meetingInvitees;
        private boolean muteUponEntry;
        private boolean participantVideo;
//        private boolean privateMeeting;
//        private boolean registrantsConfirmationEmail;
//        private boolean registrantsEmailNotification;
//        private Integer registrationType;
//        private boolean showShareButton;
//        private boolean usePmi;
       private boolean waitingRoom;
//        private boolean watermark;
//        private boolean hostSaveVideoOrder;
//        private boolean alternativeHostUpdatePolls; 


		//        private boolean internalMeeting;
 //       private ContinuousMeetingChat continuousMeetingChat;
//        private boolean participantFocusedMeeting;
        private boolean pushChangeToCalendar;
//        private List<Resource> resources;
//        private boolean autoStartMeetingSummary;
//        private boolean autoStartAiCompanionQuestions;
//        private boolean deviceTesting;
//		public List<String> getAdditionalDataCenterRegions() {
//			return additionalDataCenterRegions;
//		}
//		public void setAdditionalDataCenterRegions(List<String> additionalDataCenterRegions) {
//			this.additionalDataCenterRegions = additionalDataCenterRegions;
//		}
//		public boolean isAllowMultipleDevices() {
//			return allowMultipleDevices;
//		}
//		public void setAllowMultipleDevices(boolean allowMultipleDevices) {
//			this.allowMultipleDevices = allowMultipleDevices;
//		}
//		public String getAlternativeHosts() {
//			return alternativeHosts;
//		}
//		public void setAlternativeHosts(String alternativeHosts) {
//			this.alternativeHosts = alternativeHosts;
//		}
//		public boolean isAlternativeHostsEmailNotification() {
//			return alternativeHostsEmailNotification;
//		}
//		public void setAlternativeHostsEmailNotification(boolean alternativeHostsEmailNotification) {
//			this.alternativeHostsEmailNotification = alternativeHostsEmailNotification;
//		}
//		public Integer getApprovalType() {
//			return approvalType;
//		}
//		public void setApprovalType(int approvalType) {
//			this.approvalType = approvalType;
//		}
//		
		public String getAudio() {
			return audio;
		}
		public void setAudio(String audio) {
			this.audio = audio;
		}
		public boolean isWaitingRoom() {
			return waitingRoom;
		}
		public void setWaitingRoom(boolean waitingRoom) {
			this.waitingRoom = waitingRoom;
		}
//		public String getAudioConferenceInfo() {
//			return audioConferenceInfo;
//		}
//		public void setAudioConferenceInfo(String audioConferenceInfo) {
//			this.audioConferenceInfo = audioConferenceInfo;
//		}
//		public String getAuthenticationDomains() {
//			return authenticationDomains;
//		}
//		public void setAuthenticationDomains(String authenticationDomains) {
//			this.authenticationDomains = authenticationDomains;
//		}
//		public List<AuthenticationException> getAuthenticationException() {
//			return authenticationException;
//		}
//		public void setAuthenticationException(List<AuthenticationException> authenticationException) {
//			this.authenticationException = authenticationException;
//		}
//		public String getAuthenticationOption() {
//			return authenticationOption;
//		}
//		public void setAuthenticationOption(String authenticationOption) {
//			this.authenticationOption = authenticationOption;
//		}
		public String getAutoRecording() {
			return autoRecording;
		}
		public void setAutoRecording(String autoRecording) {
			this.autoRecording = autoRecording;
		}
	
//		public Integer getCalendarType() {
//			return calendarType;
//		}
//		public void setCalendarType(int calendarType) {
//			this.calendarType = calendarType;
//		}
//		public boolean isCloseRegistration() {
//			return closeRegistration;
//		}
//		public void setCloseRegistration(boolean closeRegistration) {
//			this.closeRegistration = closeRegistration;
//		}
//		public String getContactEmail() {
//			return contactEmail;
//		}
//		public void setContactEmail(String contactEmail) {
//			this.contactEmail = contactEmail;
//		}
//		public String getContactName() {
//			return contactName;
//		}
//		public void setContactName(String contactName) {
//			this.contactName = contactName;
//		}
		public boolean isEmailNotification() {
			return emailNotification;
		}
		public void setEmailNotification(boolean emailNotification) {
			this.emailNotification = emailNotification;
		}
//		public String getEncryptionType() {
//			return encryptionType;
//		}
//		public void setEncryptionType(String encryptionType) {
//			this.encryptionType = encryptionType;
//		}
//		public boolean isFocusMode() {
//			return focusMode;
//		}
//		public void setFocusMode(boolean focusMode) {
//			this.focusMode = focusMode;
//		}
//		public List<String> getGlobalDialInCountries() {
//			return globalDialInCountries;
//		}
//		public void setGlobalDialInCountries(List<String> globalDialInCountries) {
//			this.globalDialInCountries = globalDialInCountries;
//		}
		public boolean isHostVideo() {
			return hostVideo;
		}
		public void setHostVideo(boolean hostVideo) {
			this.hostVideo = hostVideo;
		}
//		public Integer getJbhTime() {
//			return jbhTime;
//		}
//		public void setJbhTime(int jbhTime) {
//			this.jbhTime = jbhTime;
//		}
		public boolean isJoinBeforeHost() {
			return joinBeforeHost;
		}
		public void setJoinBeforeHost(boolean joinBeforeHost) {
			this.joinBeforeHost = joinBeforeHost;
		}
		
//		public boolean isMeetingAuthentication() {
//			return meetingAuthentication;
//		}
//		public void setMeetingAuthentication(boolean meetingAuthentication) {
//			this.meetingAuthentication = meetingAuthentication;
//		}
		public List<MeetingInvitee> getMeetingInvitees() {
			return meetingInvitees;
		}
		public void setMeetingInvitees(List<MeetingInvitee> meetingInvitees) {
			this.meetingInvitees = meetingInvitees;
		}
		public boolean isMuteUponEntry() {
			return muteUponEntry;
		}
		public void setMuteUponEntry(boolean muteUponEntry) {
			this.muteUponEntry = muteUponEntry;
		}
		public boolean isParticipantVideo() {
			return participantVideo;
		}
		public void setParticipantVideo(boolean participantVideo) {
			this.participantVideo = participantVideo;
		}
//		public boolean isPrivateMeeting() {
//			return privateMeeting;
//		}
//		public void setPrivateMeeting(boolean privateMeeting) {
//			this.privateMeeting = privateMeeting;
//		}
//		public boolean isRegistrantsConfirmationEmail() {
//			return registrantsConfirmationEmail;
//		}
//		public void setRegistrantsConfirmationEmail(boolean registrantsConfirmationEmail) {
//			this.registrantsConfirmationEmail = registrantsConfirmationEmail;
//		}
//		public boolean isRegistrantsEmailNotification() {
//			return registrantsEmailNotification;
//		}
//		public void setRegistrantsEmailNotification(boolean registrantsEmailNotification) {
//			this.registrantsEmailNotification = registrantsEmailNotification;
//		}
//		public Integer getRegistrationType() {
//			return registrationType;
//		}
//		public void setRegistrationType(int registrationType) {
//			this.registrationType = registrationType;
//		}
//		public boolean isShowShareButton() {
//			return showShareButton;
//		}
//		public void setShowShareButton(boolean showShareButton) {
//			this.showShareButton = showShareButton;
//		}
//		public boolean isUsePmi() {
//			return usePmi;
//		}
//		public void setUsePmi(boolean usePmi) {
//			this.usePmi = usePmi;
//		}
//		public boolean isWaitingRoom() {
//			return waitingRoom;
//		}
//		public void setWaitingRoom(boolean waitingRoom) {
//			this.waitingRoom = waitingRoom;
//		}
//		public boolean isWatermark() {
//			return watermark;
//		}
//		public void setWatermark(boolean watermark) {
//			this.watermark = watermark;
//		}
//		public boolean isHostSaveVideoOrder() {
//			return hostSaveVideoOrder;
//		}
//		public void setHostSaveVideoOrder(boolean hostSaveVideoOrder) {
//			this.hostSaveVideoOrder = hostSaveVideoOrder;
//		}
//		public boolean isAlternativeHostUpdatePolls() {
//			return alternativeHostUpdatePolls;
//		}
//		public void setAlternativeHostUpdatePolls(boolean alternativeHostUpdatePolls) {
//			this.alternativeHostUpdatePolls = alternativeHostUpdatePolls;
//		}
//		public boolean isInternalMeeting() {
//			return internalMeeting;
//		}
//		public void setInternalMeeting(boolean internalMeeting) {
//			this.internalMeeting = internalMeeting;
//		}
//		public boolean isParticipantFocusedMeeting() {
//			return participantFocusedMeeting;
//		}
//		public void setParticipantFocusedMeeting(boolean participantFocusedMeeting) {
//			this.participantFocusedMeeting = participantFocusedMeeting;
//		}
		public boolean isPushChangeToCalendar() {
			return pushChangeToCalendar;
		}
		public void setPushChangeToCalendar(boolean pushChangeToCalendar) {
			this.pushChangeToCalendar = pushChangeToCalendar;
		}
//		public boolean isAutoStartMeetingSummary() {
//			return autoStartMeetingSummary;
//		}
//		public void setAutoStartMeetingSummary(boolean autoStartMeetingSummary) {
//			this.autoStartMeetingSummary = autoStartMeetingSummary;
//		}
//		public boolean isAutoStartAiCompanionQuestions() {
//			return autoStartAiCompanionQuestions;
//		}
//		public void setAutoStartAiCompanionQuestions(boolean autoStartAiCompanionQuestions) {
//			this.autoStartAiCompanionQuestions = autoStartAiCompanionQuestions;
//		}
//		public boolean isDeviceTesting() {
//			return deviceTesting;
//		}
//		public void setDeviceTesting(boolean deviceTesting) {
//			this.deviceTesting = deviceTesting;
//		}

        // Getters and Setters for each field in Settings
    }

       public static class AuthenticationException {
        private String email;
        private String name;
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}

        // Getters and Setters for each field in AuthenticationException
    }

    

   

   

    public static class MeetingInvitee {
        private String email;

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

        // Getters and Setters for email field in MeetingInvitee
    }

   
}
