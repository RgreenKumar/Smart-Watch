import React, { useState, useEffect, useRef } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CContainer,
  CRow,
  CCol,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSwitch,
} from "@coreui/react";
import axios from "axios";
import "./property.css";
import VITE_API_URL from "../../../Config";

const ProfileForm = () => {
  const [profileName, setProfileName] = useState("");
  const [profileURL, setProfileURL] = useState("");
  const [status, setStatus] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageCleared, setIsImageCleared] = useState(false); // Track if the user cleared the image

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileResponse = await axios.get(`${VITE_API_URL}/api/profiles`);
        const profile = profileResponse.data;
        if (profile) {
          setProfileName(profile.name);
          setProfileURL(profile.url);
          setStatus(profile.status);
        }
        
        try {
          const imageResponse = await axios.get(`${VITE_API_URL}/api/profiles/image`, {
            responseType: "blob",
          });
          if (imageResponse.data) {
            const imageUrl = URL.createObjectURL(imageResponse.data);
            setImagePreview(imageUrl);
          }
        } catch (imageError) {
          console.error("No image found or error fetching image:", imageError);
          setImagePreview(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleFileUpload = (event) => {
  const file = event.target.files && event.target.files[0];

  console.log("Selected file:", file); // 🔍 DEBUG

  if (file instanceof File) {
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
    setIsImageCleared(false);
  } else {
    console.error("Invalid file selected!");
    setProfileImage(null);
  }
};

  const handleClearImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setIsImageCleared(true); // Mark image as cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const cancelChanges = async () => {
    try {
      const profileResponse = await axios.get(`${VITE_API_URL}/api/profiles`);
      const profile = profileResponse.data;
      if (profile) {
        setProfileName(profile.name);
        setProfileURL(profile.url);
        setStatus(profile.status);
        setProfileImage(null);
        setIsImageCleared(false);
      } else {
        setProfileName("");
        setProfileURL("");
        setStatus(true);
        setProfileImage(null);
        setImagePreview(null);
        setIsImageCleared(false);
      }

      try {
        const imageResponse = await axios.get(`${VITE_API_URL}/api/profiles/image`, {
          responseType: "blob",
        });
        if (imageResponse.data) {
          const imageUrl = URL.createObjectURL(imageResponse.data);
          setImagePreview(imageUrl);
        } else {
          setImagePreview(null);
        }
      } catch (imageError) {
        console.error("No image found or error fetching image:", imageError);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

const handleSave = async () => {
  const formData = new FormData();

  formData.append("name", profileName || "");
  formData.append("url", profileURL || "");

  // ✅ ALWAYS send string
  formData.append("status", status ? "true" : "false");

  // 🔥 STRICT FILE CHECK (THIS FIXES YOUR ERROR)
  if (profileImage && profileImage instanceof File) {
    formData.append("image", profileImage);
  }

  // ✅ clear image flag
  if (isImageCleared) {
    formData.append("clearImage", "true");
  }

  // 🔍 DEBUG → VERY IMPORTANT
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await axios.post(
      `${VITE_API_URL}/api/profiles`,
      formData
      // ❗ DO NOT manually set Content-Type
    );

    alert("Profile saved successfully!");

    const data = response.data;

    setProfileName(data.name);
    setProfileURL(data.url);
    setStatus(data.status);
    setProfileImage(null);
    setIsImageCleared(false);

    // reload image
    try {
      const imageResponse = await axios.get(
        `${VITE_API_URL}/api/profiles/image`,
        { responseType: "blob" }
      );

      if (imageResponse.data) {
        setImagePreview(URL.createObjectURL(imageResponse.data));
      } else {
        setImagePreview(null);
      }
    } catch {
      setImagePreview(null);
    }

  } catch (error) {
    console.error("Save error:", error.response || error);
    alert("Error saving profile");
  }
};

  const styles = {
    container: { padding: "inherit", minHeight: "70vh" },
    cardHeader: {
      position: "sticky",
      top: "0",
      backgroundColor: "#f3f4f7",
      borderBottom: "1px solid #dee2e6",
      zIndex: 10,
    },
    cbody: { minHeight: "70vh", backgroundColor: "#f8f9fa" },
    label: {
      fontWeight: "450",
      marginBottom: "5px",
      display: "block",
      textTransform: "uppercase",
      fontSize: "15px",
      color: "#666",
    },
    inputGroup: { display: "flex", alignItems: "center", gap: "10px" },
    saveButton: {
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "5px 15px",
      fontSize: "14px",
      color: "#333",
    },
    uploadBox: {
      width: "150px",
      height: "150px",
      border: "2px dashed #ccc",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      backgroundColor: "#fff",
    },
    uploadInput: {
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    },
    uploadText: { fontSize: "14px", color: "#666" },
    recommendationText: { fontSize: "12px", color: "#666", marginTop: "5px" },
    buttonGroup: {
      position: "sticky",
      bottom: "20px",
      zIndex: 10,
      backgroundColor: "#f8f9fa",
      padding: "10px",
      borderTop: "1px solid #dee2e6",
    },
    cancelButton: {
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "5px 15px",
      fontSize: "14px",
      color: "#333",
    },
    mainSaveButton: {
      backgroundColor: "#6200ea",
      border: "none",
      borderRadius: "4px",
      padding: "5px 15px",
      fontSize: "14px",
      color: "#fff",
    },
    statusbar: {
      border: "1px solid #dee2e6",
      borderRadius: "4px",
    },
  };

  return (
    <CContainer fluid className="d-flex flex-column flex-grow-1" style={styles.container}>
      <CCard>
        <CCardHeader style={styles.cardHeader}>
          <h4 className="mb-0">Profile Overview</h4>
        </CCardHeader>
        <CCardBody className="d-flex flex-column flex-grow-1" style={styles.cbody}>
          <CRow className="mt-4 flex-grow-1">
            <CCol md={6}>
              <CForm>
                <div className="mb-4">
                  <CFormLabel style={styles.label}>Profile Name</CFormLabel>
                  <div style={styles.inputGroup}>
                    <CFormInput
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter profile name"
                      aria-label="Profile Name"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <CFormLabel style={styles.label}>Status</CFormLabel>
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={styles.statusbar}
                  >
                    <span className="me-3 m-1">{status ? "Active" : "Inactive"}</span>
                    <CFormSwitch
                      checked={status}
                      onChange={() => setStatus(!status)}
                      aria-label="Toggle status"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <CFormLabel style={styles.label}>Profile URL</CFormLabel>
                  <div style={styles.inputGroup}>
                    <CFormInput
                      type="text"
                      value={profileURL}
                      onChange={(e) => setProfileURL(e.target.value)}
                      placeholder="Enter profile URL"
                      aria-label="Profile URL"
                    />
                  </div>
                </div>
              </CForm>
            </CCol>

            <CCol md={6}>
              <CForm>
                <div className="mb-4">
                  <CFormLabel style={styles.label}>Profile Image</CFormLabel>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ ...styles.uploadBox, overflow: "hidden" }} className="image-upload-box">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ width: "110%", height: "110%", objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <p style={styles.uploadText}>Upload</p>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={styles.uploadInput}
                        aria-label="Upload profile image"
                      />
                      <div className="hover-overlay">
                        <button
                          type="button"
                          className="btn btn-sm btn-dark"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          Change
                        </button>
                        {imagePreview && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger ms-2"
                            onClick={handleClearImage}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p style={styles.recommendationText}>
                        We recommend an image of at least 512×512
                      </p>
                    </div>
                  </div>
                </div>
              </CForm>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-4" style={styles.buttonGroup}>
            <CButton style={styles.cancelButton} onClick={cancelChanges}>
              Cancel
            </CButton>
            <CButton style={styles.mainSaveButton} onClick={handleSave} className="ms-2">
              Save
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ProfileForm;