import React from "react";
import WidgetSidebar from "./WidgetSidebar";
import WidgetBody from "./WidgetBody";
import ChatWidget from "./ChatWidget";
import WidgetContent from "./WidgetContent";
import VITE_API_URL from "../../../Config";
const Channels = () => {
  const styles = {
    adminContainer: {
      display: "flex",
      fontFamily: "Arial, sans-serif",
      background: "#FFFFFF",
      margin: "0 auto",
      border: "1px solid #ccc",
      borderRadius: "10px",
      width: "100%",
      maxHeight: "100vh",
      overflowY: "auto"
    }
  };

  return (
    <div style={styles.adminContainer}>
      <WidgetSidebar />
      {/* <WidgetBody />   */}
      <ChatWidget />
      {/* <WidgetContent/> */}
    </div>
  );
};

export default Channels;