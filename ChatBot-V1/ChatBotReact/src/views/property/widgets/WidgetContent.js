// import React, { useState, useEffect } from "react";
// import { CFormSwitch } from '@coreui/react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CContainer,
//   CRow,
//   CCol,
//   CButton,
//   CForm,
//   CFormLabel,
//   CFormSelect,
//   CFormInput,
//   CFormTextarea,
//   CButtonGroup,
//   CDropdown,
//   CDropdownToggle,
//   CDropdownMenu,
//   CDropdownItem,
// } from "@coreui/react";
// import Logo from "./Logo.png";
// import Bot from "./Bot.png";

// const WidgetContent = () => {
//   const [language, setLanguage] = useState("English");
//   const [headline, setHeadline] = useState("Hi All");
//   const [textArea, setTextArea] = useState(
//     "Meganar Tech specializes in delivering software and OTT media solutions, offering cutting-edge technology for education and entertainment industries."
//   );
//   const [data,setData] = useState('');
//   const [editingHeadline, setEditingHeadline] = useState(false);
//   const [editingTextArea, setEditingTextArea] = useState(false);
//   const [alignment, setAlignment] = useState("center"); // For Heading
//   const [logoAlignment, setLogoAlignment] = useState("center"); // For Logo
//   const [textAreaAlignment, setTextAreaAlignment] = useState("center"); // For Text Area
//   const [editingLogo, setEditingLogo] = useState(false);
//   const [logoImage, setLogoImage] = useState(Logo);
//   const [cards, setCards] = useState([]); // Initialize with empty array
//   const [logoFile,setLogoFile] = useState('');
//   const [loading,setLoading] = useState(false);
//   const token = sessionStorage.getItem('token');

//   console.log("cards",cards);

//   useEffect(() => {
//     fetch('http://localhost:8080/chatbot/GetAppearance')
//       .then(res => {
//         if (!res.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return res.json();
//       })
//       .then(data => {
//         setData(data);
//         setLanguage(data.language);
//         setAlignment(data.headingAlign);
//         setLogoAlignment(data.logoAlign);
//         setTextAreaAlignment(data.textAlign);
//         setLogoImage(`data:image/png;base64,${data.logoBase64}`);
//         setHeadline(data.heading);
//         setTextArea(data.textArea);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Fetch error:', err);
//         setLoading(false);
//       });
//   }, []);

//   console.log(data);

//   const toggleCard = (id) => {
//     setCards((prev) =>
//       prev.map((card) =>
//         card.id === id ? { ...card, enabled: !card.enabled } : card
//       )
//     );
//   };

//   // Check if all required cards (Logo, Heading, Text Area) are present
//   const hasAllRequiredCards = () => {
//     const requiredTypes = ["Logo", "Heading", "Text Area"];
//     const cardTypes = cards.map((card) => card.type);
//     return requiredTypes.every((type) => cardTypes.includes(type));
//   };

//   // Get available card types to add
//   const getAvailableCardTypes = () => {
//     const requiredTypes = ["Logo", "Heading", "Text Area"];
//     const existingTypes = cards.map((card) => card.type);
//     return requiredTypes.filter((type) => !existingTypes.includes(type));
//   };

//   const addCard = (type) => {
//     const newCard = {
//       id: cards.length + 1,
//       type: type,
//       enabled: true,
//     };
//     setCards((prev) => [...prev, newCard]);
//   };

//   const handleHeadlineChange = (e) => {
//     const newHeadline = e.target.value;
//     setHeadline(newHeadline);
//   };

//   const handleTextAreaChange = (e) => {
//     setTextArea(e.target.value);
//   };

//   const handleLogoChange = (e) => {
//   const file = e.target.files[0];
//   if (file && ["image/png", "image/jpeg"].includes(file.type) && file.size < 2 * 1024 * 1024) {
//     const logoUrl = URL.createObjectURL(file);
//     setLogoImage(logoUrl);  // For preview
//     setLogoFile(file);      // For upload
//   } else {
//     alert("Please upload a PNG or JPEG image smaller than 2MB.");
//   }
// };

//   const saveChanges = async () => {
//     const formData = new FormData();
//     formData.append("Language",language);
//     formData.append("heading", headline);
//     formData.append("TextArea", textArea);
//     formData.append("logoAlign", logoAlignment);
//     formData.append("headingAlign", alignment);
//     formData.append("TextAlign", textAreaAlignment);
//     formData.append("cards", JSON.stringify(cards)); // 👈 send as JSON string
//     if (logoFile) {
//       formData.append("logo", logoFile);
//     }
//     try {
//     const response = await fetch("http://localhost:8080/chatbot/widget/appearance", {
//       method: "POST",
//       headers: {
//         Authorization: token, // Replace with actual token
//       },
//       body: formData,
//     });
//     if (response.ok) {
//       const id = await response.text();
//       alert("Widget appearance saved! ID: " + id);
//     } else {
//       const error = await response.text();
//       alert("Error: " + error);
//     }
//   } catch (err) {
//     alert("Unexpected error: " + err.message);
//   }
// };

//   return (
//     <CContainer fluid className="d-flex flex-column flex-grow-1" style={styles.container}>
//       <CCard>
//         <CCardHeader style={styles.cardHeader}>
//           <h4 className="mb-0">Channels</h4>
//         </CCardHeader> 
//         <CCardBody className="d-flex flex-column flex-grow-1" style={styles.cbody}>
//           <CRow className="mt-4 flex-grow-1">
//             {/* Left Column: Widget Content */}
//             <CCol md={6}>
//               <h6 className="fw-semibold mb-3">WIDGET CONTENT</h6>
//               <CForm>
//                 <div className="mb-4">
//                   <CFormLabel>Language</CFormLabel>
//                   <CFormSelect
//                     value={language}
//                     onChange={(e) => setLanguage(e.target.value)}
//                   >
//                     <option>English</option>
//                     <option>Spanish</option>
//                     <option>French</option>
//                   </CFormSelect>
//                 </div>

//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <CFormLabel>Header Cards</CFormLabel>
//                   <CDropdown>
//                     <CDropdownToggle
//                       color="light"
//                       size="sm"
//                       disabled={hasAllRequiredCards()}
//                     >
//                       + Add
//                     </CDropdownToggle>
//                     <CDropdownMenu>
//                       {getAvailableCardTypes().map((type) => (
//                         <CDropdownItem
//                           key={type}
//                           onClick={() => addCard(type)}
//                         >
//                           {type}
//                         </CDropdownItem>
//                       ))}
//                     </CDropdownMenu>
//                   </CDropdown>
//                 </div>

//                 {cards.length === 0 ? (
//                   <p className="text-muted">No header cards added yet. Click "Add" to start.</p>
//                 ) : (
//                   cards.map((card) => (
//                     <div key={card.id}>
//                       <CCard className="mb-2">
//                         <CCardBody className="p-2 d-flex align-items-center justify-content-between">
//                           <div className="d-flex align-items-center gap-2 ">
//                             <span style={styles.dragIcon}>⋮⋮</span>
//                             <span>{card.type}</span>
//                           </div>
//                           <div className="d-flex align-items-center gap-2">
//                             <CButton
//                               color="light"
//                               size="sm"
//                               onClick={() => {
//                                 if (card.type === "Heading") setEditingHeadline((prev) => !prev);
//                                 else if (card.type === "Logo") setEditingLogo((prev) => !prev);
//                                 else if (card.type === "Text Area") setEditingTextArea((prev) => !prev);
//                               }}
//                             >
//                               {card.type === "Heading" && editingHeadline
//                                 ? "✕"
//                                 : card.type === "Logo" && editingLogo
//                                 ? "✕"
//                                 : card.type === "Text Area" && editingTextArea
//                                 ? "✕"
//                                 : "✎"}
//                             </CButton>
//                             <div className="form-check form-switch m-0">
//                               <CFormSwitch
//                                 id={`toggle-${card.id}`}
//                                 checked={card.enabled}
//                                 onChange={() => toggleCard(card.id)}
//                                 style={styles.toggle}
//                               />
//                             </div>
//                           </div>
//                         </CCardBody>
//                       </CCard>

//                       {/* Editing Section for Logo */}
//                       {card.type === "Logo" && card.enabled && editingLogo && (
//                         <CCard className="mb-2">
//                           <CCardBody className="p-3" style={{ backgroundColor: "#f9f9f9" }}>
//                             <h6 className="fw-bold">Logo</h6>
//                             <div className="mb-2">
//                               <CFormLabel>Alignment</CFormLabel>
//                               <CButtonGroup role="group" className="d-block">
//                                 <CButton
//                                   color={logoAlignment === "left" ? "primary" : "secondary"}
//                                   variant={logoAlignment === "left" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setLogoAlignment("left")}
//                                   style={styles.alignText(logoAlignment, "left")}
//                                 >
//                                   Left
//                                 </CButton>
//                                 <CButton
//                                   color={logoAlignment === "center" ? "primary" : "secondary"}
//                                   variant={logoAlignment === "center" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setLogoAlignment("center")}
//                                   style={styles.alignText(logoAlignment, "center")}
//                                 >
//                                   Center
//                                 </CButton>
//                                 <CButton
//                                   color={logoAlignment === "right" ? "primary" : "secondary"}
//                                   variant={logoAlignment === "right" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setLogoAlignment("right")}
//                                   style={styles.alignText(logoAlignment, "right")}
//                                 >
//                                   Right
//                                 </CButton>
//                               </CButtonGroup>
//                             </div>
//                             <div className="mb-3">
//                               <CFormLabel>Upload Logo</CFormLabel>
//                               <CFormInput
//                                 type="file"
//                                 accept="image/png,image/jpeg"
//                                 onChange={handleLogoChange}
//                               />
//                             </div>
//                           </CCardBody>
//                         </CCard>
//                       )}

//                       {/* Editing Section for Heading */}
//                       {card.type === "Heading" && card.enabled && editingHeadline && (
//                         <CCard className="mb-2">
//                           <CCardBody className="p-3" style={{ backgroundColor: "#f9f9f9" }}>
//                             <h6 className="fw-bold">Heading</h6>
//                             <div className="mb-2">
//                               <CFormLabel>Alignment</CFormLabel>
//                               <CButtonGroup role="group" className="d-block">
//                                 <CButton
//                                   color={alignment === "left" ? "primary" : "secondary"}
//                                   variant={alignment === "left" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setAlignment("left")}
//                                   style={styles.alignText(alignment, "left")}
//                                 >
//                                   Left
//                                 </CButton>
//                                 <CButton
//                                   color={alignment === "center" ? "primary" : "secondary"}
//                                   variant={alignment === "center" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setAlignment("center")}
//                                   style={styles.alignText(alignment, "center")}
//                                 >
//                                   Center
//                                 </CButton>
//                                 <CButton
//                                   color={alignment === "right" ? "primary" : "secondary"}
//                                   variant={alignment === "right" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setAlignment("right")}
//                                   style={styles.alignText(alignment, "right")}
//                                 >
//                                   Right
//                                 </CButton>
//                               </CButtonGroup>
//                             </div>
//                             <div className="mb-3">
//                               <CFormLabel>Headline Text</CFormLabel>
//                               <CFormInput
//                                 type="text"
//                                 value={headline}
//                                 onChange={handleHeadlineChange}
//                                 placeholder="Enter headline"
//                               />
//                             </div>
//                           </CCardBody>
//                         </CCard>
//                       )}

//                       {/* Editing Section for Text Area */}
//                       {card.type === "Text Area" && card.enabled && editingTextArea && (
//                         <CCard className="mb-2">
//                           <CCardBody className="p-3" style={{ backgroundColor: "#f9f9f9" }}>
//                             <h6 className="fw-bold">Text Area</h6>
//                             <div className="mb-2">
//                               <CFormLabel>Alignment</CFormLabel>
//                               <CButtonGroup role="group" className="d-block">
//                                 <CButton
//                                   color={textAreaAlignment === "left" ? "primary" : "secondary"}
//                                   variant={textAreaAlignment === "left" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setTextAreaAlignment("left")}
//                                   style={styles.alignText(textAreaAlignment, "left")}
//                                 >
//                                   Left
//                                 </CButton>
//                                 <CButton
//                                   color={textAreaAlignment === "center" ? "primary" : "secondary"}
//                                   variant={textAreaAlignment === "center" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setTextAreaAlignment("center")}
//                                   style={styles.alignText(textAreaAlignment, "center")}
//                                 >
//                                   Center
//                                 </CButton>
//                                 <CButton
//                                   color={textAreaAlignment === "right" ? "primary" : "secondary"}
//                                   variant={textAreaAlignment === "right" ? "" : "outline"}
//                                   size="sm"
//                                   onClick={() => setTextAreaAlignment("right")}
//                                   style={styles.alignText(textAreaAlignment, "right")}
//                                 >
//                                   Right
//                                 </CButton>
//                               </CButtonGroup>
//                             </div>
//                             <div className="mb-3">
//                               <CFormLabel>Text Content</CFormLabel>
//                               <CFormTextarea
//                                 value={textArea}
//                                 onChange={handleTextAreaChange}
//                                 placeholder="Enter text content"
//                                 rows={4}
//                               />
//                             </div>
//                           </CCardBody>
//                         </CCard>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </CForm>
//             </CCol>

//             {/* Right Column: Widget Preview */}
//             <CCol md={6} className="d-flex flex-column align-items-center" style={styles.rightColumn}>
              
//               <CCard style={styles.previewCard}>
//               <CFormLabel className="mb-2 fw-semibold mb-3" style={styles.widgetText}> Widget Preview</CFormLabel>
//                 <CCardBody className="d-flex justify-content-center align-items-center p-0">
//                   <div style={styles.previewBox}>
//                     <div style={styles.previewHeader}>
//                       {cards.find((c) => c.type === "Logo")?.enabled && (
//                         <div style={{ textAlign: logoAlignment }}>
//                           <img src={logoImage} alt="logo" style={{ height: "40px", marginBottom: "5px" }} />
//                         </div>
//                       )}
//                       {cards.find((c) => c.type === "Heading")?.enabled && (
//                         <h5 className="text-white mb-0" style={{ textAlign: alignment }}>
//                           {headline}
//                         </h5>
//                       )}
//                       {cards.find((c) => c.type === "Text Area")?.enabled && (
//                         <p className="text-white small mb-0" style={{ textAlign: textAreaAlignment }}>
//                           {textArea}
//                         </p>
//                       )}
//                     </div>
//                     <div style={styles.previewBody}>
//                       <img src={Bot} alt="bot" style={styles.chatIcon} />
//                     </div>
//                   </div>
//                 </CCardBody>
//               </CCard>
//             </CCol>
//           </CRow>

//           <div className="d-flex justify-content-end mt-4" style={{ position: "fixed", right:"100px",top:"75vh"}}>
//             {/* <CButton color="light" className="me-2" onClick={cancelChanges}> */}
//             <CButton color="light" className="me-2">
//               Cancel
//             </CButton>
//             <CButton color="primary" onClick={saveChanges}>
//               Save
//             </CButton>
//           </div>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// const styles = {
//   alignText: (currentAlignment, buttonAlignment) => ({
//     color: currentAlignment === buttonAlignment ? "white" : "black",
//   }),
//   widgetText: {
//     fontSize: "20px",
//     fontWeight: "bold",
//     color: "#343a40",
//     marginTop: "20px",
//   },
//   cardHeader: {
//     position: "sticky", 
//     zIndex: 1,
//     top: "0",
//     backgroundColor: "#f3f4f7",
//     borderBottom: "1px solid #dee2e6",
//   },
//   leftColumn: {
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center",
//     padding: "20px",
//   },
//   rightColumn: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "20px",
//     position: "fixed", //want to change to sticky
//     right: "0",
//     left: "10",
//     top: "0",
//     width: "400px",
//     height: "100vh",
//   },
//   container: {
//     padding: "inherit",
//     maxHeight: "75vh",
//     minHeight: "75vh",
//     overflowY: "auto",
//     scrollbarWidth: "none",
//     "&::-webkit-scrollbar": {
//       display: "none",
//     },
//   },
//   cbody: {
//     minHeight: "75vh",
//     backgroundColor: "#f8f9fa",
//   },
//   previewCard: {
//     width: "400px", 
//     height: "500px", 
//     border: "none",
//     right: "70px",
//     backgroundColor: "transparent",
//   },
//   dragIcon: { fontWeight: "bold", fontSize: "16px", cursor: "grab" },
  
//   previewBox: {
//     border: "1px solid # JUDICIAL solid #ccc",
//     borderRadius: "8px",
//     backgroundColor: "#fff",
//     boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
//     position: "relative",
//     height: "80%",
//     width: "100%",
//   },
//   previewHeader: {
//     backgroundColor: "#0066cc",
//     padding: "15px",
//     borderTopLeftRadius: "8px",
//     borderTopRightRadius: "8px",
//     width: "100%",
//     height: "40%",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center",
//   },
//   previewBody: {
//     height: "0%",
//     backgroundColor: "#f5f7f9",
//     borderBottomLeftRadius: "8px",
//     borderBottomRightRadius: "8px",
//     position: "relative",
//   },
//   chatIcon: {
//     position: "absolute",
//     bottom: "-250px",
//     right: "-20px",
//     width: "50px",
//     height: "50px",
//     borderRadius: "50%",
//     border: "2px solid #dee2e6",
//     backgroundColor: "white",
//     padding: "5px",
//   },
// };

// export default WidgetContent;




import React, { useState, useEffect } from "react";
import { CFormSwitch } from '@coreui/react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CRow,
  CCol,
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";
import CIcon from '@coreui/icons-react'
import Logo from "./Logo.png";
import Bot from "./Bot.png";
import { DndContext, useSensor, useSensors, PointerSensor,  closestCenter  } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cilPlus, cilPencil } from '@coreui/icons';
import VITE_API_URL from "../../../Config";


const DraggableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

return (
    <div ref={setNodeRef} style={style} className="mb-2 border rounded p-2 bg-white">
    
    {/* Left: Drag handle */}
    <div className="d-flex align-items-center">
      <span
        {...attributes}
        {...listeners}
        className="me-3 cursor-grab"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <GripVertical size={16} />
      </span>
      <span className="fw-medium" style={{width:'100%'}}>
        {children}{/* e.g., "Text Area" or "Department" */}
      </span>
    </div>

  </div>
  )
}

const WidgetContent = () => {
  const [language, setLanguage] = useState('');
  const [headline, setHeadline] = useState('');
  const [textArea, setTextArea] = useState('');
  const [data,setData] = useState('');
  const [alignment, setAlignment] = useState(''); // For Heading
  const [logoAlignment, setLogoAlignment] = useState(''); // For Logo
  const [textAreaAlignment, setTextAreaAlignment] = useState(''); // For Text Area
  const [logoImage, setLogoImage] = useState('');
  const [cards, setCards] = useState([]); // Initialize with empty array
  const [logoFile,setLogoFile] = useState('');
  const [loading,setLoading] = useState(false);
  const [expandLogo, setExpandLogo] = useState(false)
  const [isLogoEnabled, setIsLogoEnabled] = useState(false)
  const [expandHeading, setExpandHeading] = useState(false)
  const [isHeadingEnabled, setIsHeadingEnabled] = useState(false)
  const [expandTextArea, setExpandTextArea] = useState(false)
  const [isTextAreaEnabled, setIsTextAreaEnabled] = useState(false)
  const [isEditId,setEditId] = useState('');
  const token = sessionStorage.getItem('token');
  const [items, setItems] = useState([]);

  console.log("language",language);

  useEffect(() => {
  fetch(`${VITE_API_URL}/chatbot/GetAppearance`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(data => {
      setData(data);
      setEditId(data.id);
      setLanguage(data.language);
      setAlignment(data.headingAlign);
      setLogoAlignment(data.logoAlign);
      setTextAreaAlignment(data.textAlign);
      setLogoImage(`data:image/png;base64,${data.logoBase64}`);
      setHeadline(data.heading);
      setTextArea(data.textArea);
      setItems(data.appearence); // 👈 This sets the visual card order
      setIsLogoEnabled(data.appearence.includes("Logo"));
      setIsHeadingEnabled(data.appearence.includes("Heading"));
      setIsTextAreaEnabled(data.appearence.includes("TextArea"));
      setLoading(false);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
}, []);

  console.log(data);

  const handleAddOption = (option) => {
    if (!items.includes(option)) setItems((prev) => [...prev, option])
  }

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event) => {
      const { active, over } = event
      if (active.id !== over.id) {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        setItems(arrayMove(items, oldIndex, newIndex))
      }
    }

  console.log(items);

  const toggleCard = (id) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, enabled: !card.enabled } : card
      )
    );
  };

  // Check if all required cards (Logo, Heading, Text Area) are present
  const hasAllRequiredCards = () => {
    const requiredTypes = ["Logo", "Heading", "Text Area"];
    const cardTypes = cards.map((card) => card.type);
    return requiredTypes.every((type) => cardTypes.includes(type));
  };

  // Get available card types to add
  const getAvailableCardTypes = () => {
    const requiredTypes = ["Logo", "Heading", "Text Area"];
    const existingTypes = cards.map((card) => card.type);
    return requiredTypes.filter((type) => !existingTypes.includes(type));
  };

  const addCard = (type) => {
    const newCard = {
      id: cards.length + 1,
      type: type,
      enabled: true,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleHeadlineChange = (e) => {
    const newHeadline = e.target.value;
    setHeadline(newHeadline);
  };

  const handleTextAreaChange = (e) => {
    setTextArea(e.target.value);
  };

  const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (file && ["image/png", "image/jpeg"].includes(file.type) && file.size < 2 * 1024 * 1024) {
    const logoUrl = URL.createObjectURL(file);
    setLogoImage(logoUrl);  // For preview
    setLogoFile(file);      // For upload
  } else {
    alert("Please upload a PNG or JPEG image smaller than 2MB.");
  }
};

 const saveChanges = async () => {
  const formData = new FormData();
  formData.append("Language", language);
  formData.append("heading", isHeadingEnabled ? headline : '');
  formData.append("TextArea", isTextAreaEnabled ? textArea : '');
  formData.append("logoAlign", logoAlignment);
  formData.append("headingAlign", alignment);
  formData.append("TextAlign", textAreaAlignment);
  formData.append("appearence", items); // ✅ Fix

  if (logoFile) {
    formData.append("logo", isLogoEnabled ? logoFile : "");
  }

  try {
    let response;
    if (isEditId) {
      response = await fetch(`${VITE_API_URL}/chatbot/widget/appearance/${isEditId}`, {
        method: 'PATCH',
        headers: {
          Authorization: token, // ✅ Fixed typo
        },
        body: formData,
      });
    } else {
      response = await fetch(`${VITE_API_URL}/chatbot/widget/appearance`, {
        method: "POST",
        headers: {
          Authorization: token, // ✅ Fixed typo
        },
        body: formData,
      });
    }

    if (response.ok) {
      const id = await response.text();
      alert("Widget appearance saved! ID: " + id);
    } else {
      const error = await response.text();
      alert("Error: " + error);
    }
  } catch (err) {
    alert("Unexpected error: " + err.message);
  }
};

console.log("language",language);
console.log("headingAliogn",alignment);
console.log("TextAlign",textAreaAlignment);
console.log("logoAlign",logoAlignment);

  return (
    <CContainer fluid className="d-flex flex-column flex-grow-1" style={styles.container}>
      <CCard>
        <CCardHeader style={styles.cardHeader}>
          <h4 className="mb-0">Channels</h4>
        </CCardHeader> 
        <CCardBody className="d-flex flex-column flex-grow-1" style={styles.cbody}>
          <CRow className="mt-4 flex-grow-1">
            {/* Left Column: Widget Content */}
            <CCol md={6}>
              <h6 className="fw-semibold mb-3">WIDGET CONTENT</h6>
              <CForm>
                <div className="mb-4">
                  <CFormLabel>Language</CFormLabel>
                  <CFormSelect
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                  </CFormSelect>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel>Header Cards</CFormLabel>
                  <CDropdown>
                    <CDropdownToggle
                      color="light"
                      size="sm"
                      disabled={hasAllRequiredCards()}
                    >
                      + Add
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => handleAddOption('Logo')}>
                        Logo
                      </CDropdownItem>
                      <CDropdownItem onClick={() => handleAddOption('Heading')}>
                        Heading
                      </CDropdownItem>
                      <CDropdownItem onClick={() => handleAddOption('TextArea')}>
                        Text Area
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <React.Fragment key={item}>
            <DraggableItem id={item}>
              <div className="rounded bg-white mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{item}</strong>
                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <CButton
                        color="link"
                        onClick={() => {
                          if (item === 'Logo') setExpandLogo((prev) => !prev);
                          else if (item === 'Heading') setExpandHeading((prev) => !prev);
                          else if (item === 'TextArea') setExpandTextArea((prev) => !prev);
                        }}
                      >
                        <CIcon icon={cilPlus} />
                    </CButton>
                    <CFormSwitch
                      id={`switch-${item}`}
                      checked={
                        item === 'Logo'
                          ? isLogoEnabled
                          : item === 'Heading'
                          ? isHeadingEnabled
                          : isTextAreaEnabled
                      }
                      onChange={() => {
                        if (item === 'Logo') setIsLogoEnabled((prev) => !prev);
                        else if (item === 'Heading') setIsHeadingEnabled((prev) => !prev);
                        else if (item === 'TextArea') setIsTextAreaEnabled((prev) => !prev);
                      }}
                    />

                  </div>
                </div>
              </div>
            </DraggableItem>

            {item === 'Logo' && expandLogo && (
        <CCard className="mb-3">
          <CCardBody className="p-3" style={{ backgroundColor: '#f9f9f9' }}>
            <h6 className="fw-bold">Logo</h6>
            <div className="mb-2">
              <CFormLabel>Alignment</CFormLabel>
              <CButtonGroup role="group" className="d-block">
                {['left', 'center', 'right'].map((pos) => (
                  <CButton
                    key={pos}
                    color={logoAlignment === pos ? 'primary' : 'secondary'}
                    variant={logoAlignment === pos ? '' : 'outline'}
                    size="sm"
                    onClick={() => setLogoAlignment(pos)}
                    style={styles.alignText(logoAlignment, pos)}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </CButton>
                ))}
              </CButtonGroup>
            </div>
            <div className="mb-3">
              <CFormLabel>Upload Logo</CFormLabel>
              <CFormInput
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
              />
            </div>
          </CCardBody>
        </CCard>
      )}

      {item === 'Heading' && expandHeading && (
        <CCard className="mb-3">
          <CCardBody className="p-3" style={{ backgroundColor: '#f9f9f9' }}>
            <h6 className="fw-bold">Heading</h6>
            <div className="mb-2">
              <CFormLabel>Alignment</CFormLabel>
              <CButtonGroup role="group" className="d-block">
                {['left', 'center', 'right'].map((pos) => (
                  <CButton
                    key={pos}
                    color={alignment === pos ? 'primary' : 'secondary'}
                    variant={alignment === pos ? '' : 'outline'}
                    size="sm"
                    onClick={() => setAlignment(pos)}
                    style={styles.alignText(alignment, pos)}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </CButton>
                ))}
              </CButtonGroup>
            </div>
            <div className="mb-3">
              <CFormLabel>Headline Text</CFormLabel>
              <CFormInput
                type="text"
                value={headline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
              />
            </div>
          </CCardBody>
        </CCard>
      )}

      {item === 'TextArea' && expandTextArea && (
        <CCard className="mb-3">
          <CCardBody className="p-3" style={{ backgroundColor: '#f9f9f9' }}>
            <h6 className="fw-bold">Text Area</h6>
            <div className="mb-2">
              <CFormLabel>Alignment</CFormLabel>
              <CButtonGroup role="group" className="d-block">
                {['left', 'center', 'right'].map((pos) => (
                  <CButton
                    key={pos}
                    color={textAreaAlignment === pos ? 'primary' : 'secondary'}
                    variant={textAreaAlignment === pos ? '' : 'outline'}
                    size="sm"
                    onClick={() => setTextAreaAlignment(pos)}
                    style={styles.alignText(textAreaAlignment, pos)}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </CButton>
                ))}
              </CButtonGroup>
            </div>
            <div className="mb-3">
              <CFormLabel>Text Content</CFormLabel>
              <CFormTextarea
                value={textArea}
                onChange={handleTextAreaChange}
                placeholder="Enter text content"
                rows={4}
              />
            </div>
          </CCardBody>
        </CCard>
      )}
          </React.Fragment>
        ))}
      </SortableContext>
    </DndContext>
              </CForm>
            </CCol>

            {/* Right Column: Widget Preview */}
            <CCol md={6} className="d-flex flex-column align-items-center" style={styles.rightColumn}>
              
              <CCard style={styles.previewCard}>
              <CFormLabel className="mb-2 fw-semibold mb-3" style={styles.widgetText}> Widget Preview</CFormLabel>
                <CCardBody className="d-flex justify-content-center align-items-center p-0">
                  <div style={styles.previewBox}>
                    <div style={styles.previewHeader}>
                       {items.map((item, index) => {
  if (item === 'Logo' && logoImage && isLogoEnabled) {
    return (
      <div key={index} style={{ textAlign: logoAlignment }}>
        <img src={logoImage} alt="logo" style={{ height: "40px", marginBottom: "5px" }} />
      </div>
    );
  }
  if (item === 'Heading' && isHeadingEnabled) {
    return (
      <h5 key={index} className="text-white mb-0" style={{ textAlign: alignment }}>
        {headline}
      </h5>
    );
  }
  if (item === 'TextArea' && isTextAreaEnabled) {
    return (
      <p key={index} className="text-white small mb-0" style={{ textAlign: textAreaAlignment }}>
        {textArea}
      </p>
    );
  }
  return null;
})}

                    </div>
                    <div style={styles.previewBody}>
                      <img src={Bot} alt="bot" style={styles.chatIcon} />
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-4" style={{ position: "fixed", right:"100px",top:"75vh"}}>
            {/* <CButton color="light" className="me-2" onClick={cancelChanges}> */}
            <CButton color="light" className="me-2">
              Cancel
            </CButton>
            <CButton color="primary" onClick={saveChanges}>
              Save
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

const styles = {
  alignText: (currentAlignment, buttonAlignment) => ({
    color: currentAlignment === buttonAlignment ? "white" : "black",
  }),
  widgetText: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#343a40",
    marginTop: "20px",
  },
  cardHeader: {
    position: "sticky", 
    zIndex: 1,
    top: "0",
    backgroundColor: "#f3f4f7",
    borderBottom: "1px solid #dee2e6",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "20px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "fixed", //want to change to sticky
    right: "0",
    left: "10",
    top: "0",
    width: "400px",
    height: "100vh",
  },
  container: {
    padding: "inherit",
    maxHeight: "75vh",
    minHeight: "75vh",
    overflowY: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  cbody: {
    minHeight: "75vh",
    backgroundColor: "#f8f9fa",
  },
  previewCard: {
    width: "400px", 
    height: "500px", 
    border: "none",
    right: "70px",
    backgroundColor: "transparent",
  },
  dragIcon: { fontWeight: "bold", fontSize: "16px", cursor: "grab" },
  
  previewBox: {
    border: "1px solid # JUDICIAL solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
    position: "relative",
    height: "80%",
    width: "100%",
  },
  previewHeader: {
    backgroundColor: "#0066cc",
    padding: "15px",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    width: "100%",
    height: "40%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  previewBody: {
    height: "0%",
    backgroundColor: "#f5f7f9",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    position: "relative",
  },
  chatIcon: {
    position: "absolute",
    bottom: "-250px",
    right: "-20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "2px solid #dee2e6",
    backgroundColor: "white",
    padding: "5px",
  },
};

export default WidgetContent;

