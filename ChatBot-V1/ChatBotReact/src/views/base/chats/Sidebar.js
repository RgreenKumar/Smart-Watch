import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faMessage,
  faTicket,
  faExclamationCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Logo from "./chat.png";
// import Compose from "../base/Compose";
import Tickets from "../base/Tickets";


const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.sideChat}>
      <img src={Logo} alt="Logo" style={styles.navLogo} />
      
      {/* <button style={styles.sidebarBtn} onClick={() => navigate("/Compose")}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
      <h6 style={styles.sidebarBtnText}>Compose</h6> */}

      <button style={{ ...styles.sidebarBtn, ...styles.activeSidebarBtn }} onClick={() => navigate("/chats")}>
        <FontAwesomeIcon icon={faMessage} />
      </button>
      <h6 style={styles.sidebarBtnText}>Chats</h6>

      <button style={styles.sidebarBtn} onClick={() => navigate("/Tickets")}>
        <FontAwesomeIcon icon={faTicket} />
      </button>
      <h6 style={styles.sidebarBtnText}>Requests</h6>

      <button style={styles.sidebarBtn} onClick={() => navigate("/spam")}>
        <FontAwesomeIcon icon={faExclamationCircle} />
      </button>
      <h6 style={styles.sidebarBtnText}>Spam</h6>

      <button style={styles.sidebarBtn} onClick={() => navigate("/trash")}>
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <h6 style={styles.sidebarBtnText}>Trash</h6>
    </div>
  );
};

export default Sidebar;

// Internal CSS Styles
const styles = {
  sideChat: {
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    height: "auto",
    width: "70px",
    alignItems: "center",
    borderRight: "1px solid #dee2e6",
    border: "1px solid #dee2e6",  
  },
  navLogo: {
    width: "80%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #B3B3B3",
    marginTop: "10px",
    marginBottom: "50px",
  },
  sidebarBtn: {
    backgroundColor: "white",
    color: "black",
    border: "1px solid #B3B3B3",
    borderRadius: "10px",
    margin: "5px auto",
    cursor: "pointer",
    fontSize: "17px",
    width: "80%",
    height: "50px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background 0.3s",
  },
  activeSidebarBtn: {
    backgroundColor: "#0162C4",
    color: "white",
  },
  sidebarBtnText: {
    fontSize: "12px",
    textAlign: "center",
  },
};