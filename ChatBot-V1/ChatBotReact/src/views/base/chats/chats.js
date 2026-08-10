import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatProperties from "./ChatProperties";
import ChatUsers from "./ChatUsers";
import ChatBody from "./ChatBody";
import axios from "axios";
import VITE_API_URL from "../../../Config";

const getTheme = () => {
  return document.body.getAttribute("data-coreui-theme") === "dark" ? "dark" : "light";
};

const Chats = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showProperties, setShowProperties] = useState(false); // New state

  // Fetch properties
  useEffect(() => {
    if (!token) return;
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/properties/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(res.data?.properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, [token]);

  // Fetch users based on selected property
  useEffect(() => {
    if (!selectedProperty || !token) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_URL}/user/auth/property/${selectedProperty.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(res.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [selectedProperty, token]);

  // Fetch chat messages
  const fetchMessages = async () => {
    if (!selectedProperty || !selectedChat) return;

    try {
      const [sentRes, receivedRes] = await Promise.all([
        axios.get(
          `${VITE_API_URL}/chat/${selectedProperty.id}/sent/${selectedChat.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${VITE_API_URL}/chat/${selectedProperty.id}/${selectedChat.username}/received`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const sentMessages = Array.isArray(sentRes.data)
        ? sentRes.data
        : sentRes.data?.chat || [];
      const receivedMessages = Array.isArray(receivedRes.data)
        ? receivedRes.data
        : receivedRes.data?.chat || [];

      const all = [...sentMessages, ...receivedMessages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setChatMessages(all);
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error);
      setChatMessages([]);
    }
  };

  useEffect(() => {
    if (!selectedProperty || !selectedChat) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [selectedProperty, selectedChat]);

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !selectedProperty) {
      return alert("Select a property, user & enter a message!");
    }

    const payload = {
      propertyId: selectedProperty.id,
      message,
      receiver: selectedChat.username,
      senderType: "admin",
    };

    try {
      await axios.post(`${VITE_API_URL}/chat/send`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error);
      alert("Failed to send message.");
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setShowProperties(false); // Auto close after selecting
  };

  return (
    <div style={styles.chat}>
      <div style={styles.chatContainer}>
        <Sidebar />

        {/* Button to open/close property panel */}
        <div style={styles.togglePanel}>
          <button onClick={() => setShowProperties(!showProperties)} style={styles.button}>
            {showProperties ? "Close Properties" : "Select Property"}
          </button>
        </div>

        {/* Conditionally render ChatProperties as popup */}
        {showProperties && (
          <div style={styles.popupOverlay}>
            <div style={styles.popup}>
              <ChatProperties
                properties={properties}
                selectedProperty={selectedProperty}
                onSelect={handlePropertySelect}
              />
              <button onClick={() => setShowProperties(false)} style={styles.closeBtn}>×</button>
            </div>
          </div>
        )}

        <ChatUsers
          users={users}
          selectedUser={selectedChat}
          onSelect={setSelectedChat}
          hasProperty={!!selectedProperty}
        />
        <ChatBody
          selectedUser={selectedChat}
          selectedProperty={selectedProperty}
          chatMessages={chatMessages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chats;

const styles = {
  chat: {
    borderRadius: "5px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  
  },
  chatContainer: {
    display: "flex",
    margin: "0 auto",
    color: getTheme() === "dark" ? "#ffffff" : "#000000",
    width: "100%",
    background: getTheme() === "dark" ? "#343a40" : "#f8f9fa",
    height: "550px",
    transition: "background 0.3s ease, color 0.3s ease",
    position: "relative",
  },
  togglePanel: {
    position: "absolute",
    top: 10,
    left: 120,
    zIndex: 10,
  },
  button: {
    margin: "0 auto",
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    marginLeft: "80px",
    marginTop: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    width: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 15,
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
};
