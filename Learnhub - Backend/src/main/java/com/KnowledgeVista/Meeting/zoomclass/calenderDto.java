package  com.KnowledgeVista.Meeting.zoomclass;


public class calenderDto {
	    private Long MeetingId;
	    private String topic;
	    private String JoinUrl;
	    private String startTime;
	    private Integer duration;
		
	    
		public Long getMeetingId() {
			return MeetingId;
		}
		public void setMeetingId(Long meetingId) {
			MeetingId = meetingId;
		}
		public String getTopic() {
			return topic;
		}
		public void setTopic(String topic) {
			this.topic = topic;
		}
		public String getJoinUrl() {
			return JoinUrl;
		}
		public void setJoinUrl(String joinUrl) {
			JoinUrl = joinUrl;
		}
		public String getStartTime() {
			return startTime;
		}
		public void setStartTime(String startTime) {
			this.startTime = startTime;
		}
		
	    public Integer getDuration() {
			return duration;
		}
		public void setDuration(Integer duration) {
			this.duration = duration;
		}
		public calenderDto(Long MeetingId, String topic, String joinUrl, String startTime,Integer duration) {
	       
	        this.topic = topic;
	        this.JoinUrl = joinUrl;
	        this.startTime = startTime;
	        this.duration=duration;
	        this.MeetingId=MeetingId;
	    
	    }

	    // Default constructor (optional)
	    public calenderDto() {
	    }

}
