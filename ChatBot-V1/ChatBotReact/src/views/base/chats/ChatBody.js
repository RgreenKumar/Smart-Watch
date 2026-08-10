import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faList, faPaperPlane, faSearch } from "@fortawesome/free-solid-svg-icons";
import ChatIcon from "./ChatIcon.png";
const ChatBody = ({
  selectedUser,
  selectedProperty,
  chatMessages,
  message,
  setMessage,
  sendMessage,
  handleFileUpload,
}) => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const isOneToOne = selectedProperty?.chatbotType === "ONE_TO_ONE";

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <div style={styles.profileSection}>
          <div style={styles.avatar}>
            <img src="https://picsum.photos/150" alt="User Avatar" style={styles.userAvatar} />
            <span style={styles.statusIndicator}></span>
          </div>
          <div>
            <div style={styles.userName}>
            {selectedUser && selectedProperty
                ? `${selectedUser.username} (${selectedProperty.propertyName})`
                : "Select a user and property"}
            </div>
            <div style={styles.userStatus}>
            {admin ? admin.name : "Admin"}
            </div>
          </div>
        </div>

        <div style={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
          <input type="text" placeholder="Search" style={styles.searchInput} />
        </div>
        
      </div>

      <div style={styles.chatBox}>
        {selectedUser && selectedProperty ? (
          chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => {
              const isSentByMe = msg.sender !== selectedUser.username;
              const isKnowledgeBased = selectedProperty.chatbotType === "KNOWLEDGE_BASED";
              const isQuestionList =
                isKnowledgeBased && msg.message.startsWith("Here are some related questions,");

              return (
                <div
                  key={index}
                  style={{
                    ...styles.message,
                    backgroundColor: isSentByMe ? "#0078FF" : "white",
                    alignSelf: isSentByMe ? "flex-end" : "flex-start",
                    color: isSentByMe ? "#fff": "#000",
                  }}
                >
                  {/* <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: 4 }}>
                    {isSentByMe ? "You" : msg.sender}
                  </div> */}

                  {isQuestionList ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {msg.message
                        .replace("Here are some related questions,", "")
                        .split(",")
                        .map((q, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: "#e0e0e0",
                              color: "#000",
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          >
                            {q.trim()}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0 }}>{msg.message}</p>
                  )}

                  {/* <div style={{ fontSize: "10px", marginTop: 6, textAlign: "right", color: "#ccc" }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "N/A"}
                  </div> */}
                </div>
              );
            })
          ) : (
            // <p style={{ textAlign: "center", color: "#888" }}>No messages yet</p>
            <img src={ChatIcon} alt="No messages" style={{ width: "200px", margin: "auto"  }} />
          )
        ) : (
          <p style={{ textAlign: "center", color: "#888", margin: "auto" }}>Select a user and property to chat</p>
        )}
      </div>

      {/* {selectedUser && isOneToOne && ( */}
        <div style={styles.messageInput}>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            style={styles.iconButton}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FontAwesomeIcon icon={faLink} />
          </button>
          <input
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            style={styles.inputField}
          />
          <button onClick={sendMessage} style={styles.sendButton}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      {/* )} */}
    </div>
  );
};

// Same internal styles as before
const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "550px",
    width: "350px",
    flexGrow: 1,
    border: "1px solid #ddd",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #ddd",
    padding: "10px",
    color: "#fff",
    backgroundColor: "#F8FAFF",
    fontWeight: "bold",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    position: "relative",
    marginRight: "10px",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  statusIndicator: {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    width: "10px",
    height: "10px",
    backgroundColor: "green",
    borderRadius: "50%",
    border: "2px solid white",
  },
  userName: {
    fontSize: "14px",
    color: "black",
    fontWeight: "none",
  },
  userStatus: {
    fontSize: "12px",
    color: "BLACK",
  },
  searchBar: {
    marginRight: "10%",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: "15px",
    border: "1px solid #B3B3B3",
    padding: "3px 8px",
    width: "27%",
  },
  searchIcon: {
    color: "#0078FF",
    marginRight: "5px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100px",
    background: "transparent",
    color: "#000",
    fontSize: "12px",
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backgroundColor: "#f1f1f1",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "15px",
    marginBottom: "10px",
    maxWidth: "70%",
  },
  messageInput: {
    display: "flex",
    alignItems: "center",
    padding: "8px",
    backgroundColor: "#fff",
    borderTop: "1px solid #ddd",
  },
  iconButton: {
    background: "white",
    border: "none",
    fontSize: "16px",
    color: "#0078FF",
    marginRight: "8px",
    cursor: "pointer",
  },
  inputField: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ddd",
    background: "#f1f3f5",
    color: "#000",
    borderRadius: "15px",
    outline: "none",
  },
  sendButton: {
    background: "#0078FF",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    marginLeft: "8px",
  },
};

export default ChatBody;
