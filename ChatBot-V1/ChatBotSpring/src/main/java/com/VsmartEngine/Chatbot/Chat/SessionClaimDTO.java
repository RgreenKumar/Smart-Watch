package com.VsmartEngine.Chatbot.Chat;

public class SessionClaimDTO {

    private String sessionId;
    private Long   departmentId;
    private String agentEmail;   // ← NEW: needed for take-over broadcast

    public SessionClaimDTO() {}

    public SessionClaimDTO(String sessionId, Long departmentId, String agentEmail) {
        this.sessionId    = sessionId;
        this.departmentId = departmentId;
        this.agentEmail   = agentEmail;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getAgentEmail() { return agentEmail; }
    public void setAgentEmail(String agentEmail) { this.agentEmail = agentEmail; }
}
