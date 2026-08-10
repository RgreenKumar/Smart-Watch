import React, { use, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faSliders,
  faGear,
  faUserGear,
  faCommentAlt,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

const WidgetSidebar = () => {
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const styles = {
    sidebar: {
      width: "240px",
      background: "#fff",
      padding: "20px 10px",
      height: "75vh",
      borderRight: "1px solid #eee",
      fontFamily: "sans-serif",
    },
    header: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "20px",
      paddingLeft: "10px",
    },
    button: {
      display: "flex",
      alignItems: "center",
      padding: "10px",
      width: "100%",
      background: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#111",
      marginBottom: "5px",
      justifyContent: "space-between",
    },
    leftContent: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    active: {
      backgroundColor: "#f2f3f5",
    },
    arrow: {
      fontSize: "14px",
      color: "#888",
    },
    dropdown: {
      paddingLeft: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      marginBottom: "10px",
    },
    subButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#333",
      background: "transparent",
      border: "none",
      textAlign: "left",
      cursor: "pointer",
      padding: "6px 0",
    },
  };

  const MenuButton = ({ icon, label, hasArrow, active, onClick, isOpen }) => (
    <button
      onClick={onClick}
      style={{ ...styles.button, ...(active ? styles.active : {}) }}
    >
      <div style={styles.leftContent}>
        <FontAwesomeIcon icon={icon} />
        {label}
      </div>
      {hasArrow && (
        <span style={styles.arrow}>{isOpen ? "˅" : "›"}</span>
      )}
    </button>
  );

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>Administration</div>

      <MenuButton icon={faTableColumns} label="Overview" active />

      <MenuButton
        icon={faSliders}
        label="Channels"
        hasArrow
        isOpen={isChannelsOpen}
        onClick={() => setIsChannelsOpen(!isChannelsOpen)}
      />
      {isChannelsOpen && (
        <div style={styles.dropdown}>
          <button style={styles.subButton} >
            <FontAwesomeIcon icon={faCommentAlt} />
            Chat Widget
          </button>
          <button style={styles.subButton}>
            <FontAwesomeIcon icon={faImage} />
            Widget Content
          </button>
        </div>
      )}

      <MenuButton icon={faGear} label="Settings" hasArrow />
      <MenuButton 
        icon={faUserGear} 
        label="User Management" 
        hasArrow 
        isOpen={isUserManagementOpen}
        onClick={()=> setIsUserManagementOpen(!isUserManagementOpen)}
      />
      {isUserManagementOpen && (
        <div style={styles.dropdown}>
          <button style={styles.subButton}>
            <FontAwesomeIcon icon={faCommentAlt} />
            Property Members
          </button>
          <button style={styles.subButton}>
            <FontAwesomeIcon icon={faImage} />
            Departments
          </button>
        </div>
      )}
    </div>
  );
};

export default WidgetSidebar;


// import React, { useState } from "react";
// import {
//   CSidebar,
//   CSidebarNav,
//   CNavTitle,
//   CNavItem,
//   CNavGroup,
//   CButton,
//   CCard, CCardBody,
// } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import {
//   cilColumns,
//   cilApplications,
//   cilSettings,
//   cilUser,
//   cilCommentBubble,
//   cilImage,
//   cilArrowBottom,
//   cilArrowRight,
// } from "@coreui/icons";

// const WidgetSidebar = () => {
//   const [isChannelsOpen, setIsChannelsOpen] = useState(false);
//   const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

//   const toggleArrowIcon = (open) => (open ? cilArrowBottom : cilArrowRight);

//   return (
//     <CCard className="mb-4">
//       <CCardBody className='p-0'>
//     <CSidebar
//       className="border-end bg-white"
//       style={{ width: "240px", height: "75vh", fontFamily: "sans-serif" }}
//     >
//       <CSidebarNav className="p-3">
//         <CNavTitle className="fs-6 fw-semibold ps-2 mb-3">Administration</CNavTitle>

//         {/* Overview */}
//         <CNavItem className="mb-2">
//           <CButton
//             color="light"
//             className="w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded"
//           >
//             <CIcon icon={cilColumns} />
//             <span className="flex-grow-1">Overview</span>
//           </CButton>
//         </CNavItem>

//         {/* Channels */}
//         <CNavItem className="mb-1">
//           <CButton
//             color="light"
//             className="w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded"
//             onClick={() => setIsChannelsOpen(!isChannelsOpen)}
//           >
//             <div className="d-flex align-items-center gap-2">
//               <CIcon icon={cilApplications} />
//               <span>Channels</span>
//             </div>
//             <CIcon icon={toggleArrowIcon(isChannelsOpen)} className="text-secondary" />
//           </CButton>
//         </CNavItem>
//         {isChannelsOpen && (
//           <div className="ps-4 d-flex flex-column gap-1 mb-3">
//             <CButton
//               color="light"
//               className="text-start d-flex align-items-center gap-2 px-2 py-1 border-0"
//             >
//               <CIcon icon={cilCommentBubble} />
//               Chat Widget
//             </CButton>
//             <CButton
//               color="light"
//               className="text-start d-flex align-items-center gap-2 px-2 py-1 border-0"
//             >
//               <CIcon icon={cilImage} />
//               Widget Content
//             </CButton>
//           </div>
//         )}

//         {/* Settings */}
//         <CNavItem className="mb-2">
//           <CButton
//             color="light"
//             className="w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded"
//           >
//             <CIcon icon={cilSettings} />
//             <span className="flex-grow-1">Settings</span>
//           </CButton>
//         </CNavItem>

//         {/* User Management */}
//         <CNavItem className="mb-1">
//           <CButton
//             color="light"
//             className="w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded"
//             onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}
//           >
//             <div className="d-flex align-items-center gap-2">
//               <CIcon icon={cilUser} />
//               <span>User Management</span>
//             </div>
//             <CIcon
//               icon={toggleArrowIcon(isUserManagementOpen)}
//               className="text-secondary"
//             />
//           </CButton>
//         </CNavItem>
//         {isUserManagementOpen && (
//           <div className="ps-4 d-flex flex-column gap-1">
//             <CButton
//               color="light"
//               className="text-start d-flex align-items-center gap-2 px-2 py-1 border-0"
//             >
//               <CIcon icon={cilCommentBubble} />
//               Property Members
//             </CButton>
//             <CButton
//               color="light"
//               className="text-start d-flex align-items-center gap-2 px-2 py-1 border-0"
//             >
//               <CIcon icon={cilImage} />
//               Departments
//             </CButton>
//           </div>
//         )}
//       </CSidebarNav>
//     </CSidebar>
//     </CCardBody>
//     </CCard>
//   );
// };

// export default WidgetSidebar;
