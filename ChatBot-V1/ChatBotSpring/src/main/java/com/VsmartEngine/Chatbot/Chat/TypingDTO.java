package com.VsmartEngine.Chatbot.Chat;

/**
 * TypingDTO
 * =========
 * Payload for /app/typing WebSocket messages.
 *
 * Both the chatbot widget (visitor) and the React admin panel (agent) send
 * this when the user starts or stops typing, so the other side can show or
 * hide the "Typing..." indicator.
 *
 * Fields:
 *   sessionId — the active chat session
 *   sender    — email / identifier of the typist
 *   role      — "USER" (visitor) or "AGENT"
 *   typing    — true = started typing, false = stopped
 */
public class TypingDTO {

    private String  sessionId;
    private String  sender;
    private String  role;       // "USER" | "AGENT"
    private boolean typing;

    public TypingDTO() {}

    public String getSessionId()             { return sessionId; }
    public void   setSessionId(String v)     { this.sessionId = v; }

    public String getSender()                { return sender; }
    public void   setSender(String v)        { this.sender = v; }

    public String getRole()                  { return role; }
    public void   setRole(String v)          { this.role = v; }

    public boolean isTyping()                { return typing; }
    public void    setTyping(boolean v)      { this.typing = v; }
}