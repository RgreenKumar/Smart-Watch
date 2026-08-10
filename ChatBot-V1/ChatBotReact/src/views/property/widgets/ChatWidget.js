import React, { useState, useEffect } from "react";
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
} from "@coreui/react";
import { useNavigate } from "react-router-dom";
import VITE_API_URL from '../../../Config';

const WidgetForm = () => {
  const token = sessionStorage.getItem('token');
  const [propertyName, setPropertyName]   = useState("");
  const [websiteUrl,   setWebsiteUrl]     = useState("");
  const [widgetColor,  setWidgetColor]    = useState("#61a1d1");
  const [scriptText,   setScriptText]     = useState("");
  const [errorMessage, setErrorMessage]   = useState("");
  const [saveMessage,  setSaveMessage]    = useState("");   // ← was missing, caused crash
  const [loading,      setLoading]        = useState(false);
  const [copySuccess,  setCopySuccess]    = useState(false);
  const [scriptId,     setScriptId]       = useState(null);
  const [isGenerated,  setIsGenerated]    = useState(false);
  const navigate = useNavigate();

  // ── Load saved appearance on mount ──────────────────────────────────────
  useEffect(() => {
    fetch(`${VITE_API_URL}/chatbot/GetAppearance`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setPropertyName(data.propertyName  || "");
        setWebsiteUrl(data.websiteURL      || "");
        // Apply the saved buttonColor so the preview swatch matches the widget
        setWidgetColor(data.buttonColor    || "#61a1d1");
        setScriptText(data.widgetScript    || "");
        setScriptId(data.id);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const isValidURL = (url) => /^http:\/\/[^"']+$/.test(url);

  // ── Generate (preview) — does NOT persist to DB yet ─────────────────────
  // The buttonColor is sent so the server embeds it in the widget JS:
  //   • #chatbot-launcher  background-color
  //   • #chatbot-send-button background-color
  //   • .chatbot-header    background-color
  //   • .chatbot-form button background-color
  const generateWidget = async () => {
    setErrorMessage("");
    setSaveMessage("");
    setScriptText("");

    if (!scriptId) {
      alert('Please create appearance first.');
      navigate("/administration/widget-content");
      return;
    }
    if (!propertyName || !websiteUrl) {
      setErrorMessage("Property Name and Website URL are required.");
      return;
    }
    if (!isValidURL(websiteUrl)) {
      setErrorMessage("Please enter a valid Website URL starting with http://");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("scriptId",     scriptId);
      formData.append("propertyName", propertyName);
      formData.append("websiteURL",   websiteUrl);
      // ← KEY FIX: always send the currently selected color
      formData.append("buttonColor",  widgetColor);

      const response = await fetch(`${VITE_API_URL}/chatbot/property/generate`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const text = await response.text();
      setLoading(false);

      if (response.ok) {
        setScriptText(text);
        setIsGenerated(true);
        setSaveMessage("");
      } else {
        setErrorMessage(text || "Something went wrong!");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Failed to generate widget. Try again later.");
      console.error("Error generating script:", error);
    }
  };

  // ── Save — persists property info + script + color to DB ────────────────
  const saveWidget = async () => {
    if (!isGenerated) {
      alert("Please generate the widget script before saving.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSaveMessage("");

    try {
      const formData = new FormData();
      formData.append("scriptId",     scriptId);
      formData.append("propertyName", propertyName);
      formData.append("websiteURL",   websiteUrl);
      // ← KEY FIX: persist the chosen color so it's used when the widget
      //   is served to the visitor site via GET /chatbot/widget/{id}
      formData.append("buttonColor",  widgetColor);
      formData.append("widgetScript", scriptText);

      const response = await fetch(`${VITE_API_URL}/chatbot/property/save`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const text = await response.text();
      setLoading(false);

      if (response.ok) {
        setSaveMessage("Widget saved successfully!");
        setIsGenerated(false);
      } else {
        setErrorMessage(text || "Failed to save widget.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Failed to save widget. Try again later.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const cancelChanges = () => {
    setPropertyName("");
    setWebsiteUrl("");
    setWidgetColor("#61a1d1");
    setScriptText("");
    setErrorMessage("");
    setSaveMessage("");
  };

  return (
    <CContainer fluid className="d-flex flex-column flex-grow-1" style={styles.container}>
      <CCard>
        <CCardHeader style={styles.cardHeader}>
          <h4 className="mb-0">Channels</h4>
        </CCardHeader>
        <CCardBody className="d-flex flex-column flex-grow-1" style={styles.cbody}>
          <CRow className="mt-4 flex-grow-1">

            {/* ── Left Column: Form Inputs ── */}
            <CCol md={6}>
              <CForm>
                <div className="mb-4">
                  <CFormLabel style={styles.label}>Property Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    aria-label="Property Name"
                  />
                </div>

                <div className="mb-4">
                  <CFormLabel style={styles.label}>Website URL</CFormLabel>
                  <CFormInput
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    aria-label="Website URL"
                  />
                </div>

                {/* Widget Color — drives the launcher button + send button color */}
                <div className="mb-4">
                  <CFormLabel style={styles.label}>Widget Color</CFormLabel>
                  <div style={styles.colorBoxContainer}>
                    {/*
                      The color input updates widgetColor state.
                      widgetColor is sent as "buttonColor" to the backend on both
                      Generate and Save, so the served widget JS uses this color for:
                        • #chatbot-launcher  (the floating robot button)
                        • #chatbot-send-button
                        • .chatbot-header
                        • .chatbot-form button (Start Chat)
                    */}
                    <CFormInput
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      style={styles.colorBox}
                      aria-label="Widget Color"
                    />
                    <span style={styles.colorHex}>{widgetColor}</span>

                    {/* Live preview swatch so the admin can see the color immediately */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      backgroundColor: widgetColor,
                      border: "2px solid #ddd",
                      marginLeft: "auto",
                      flexShrink: 0,
                      title: "Widget button preview",
                    }} title="Launcher button preview" />
                  </div>
                  <p style={styles.colorHint}>
                    This color is applied to the chat launcher button, header, and Send button.
                  </p>
                </div>

                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                {saveMessage  && <p className="text-success">{saveMessage}</p>}

                <CButton
                  color="success"
                  onClick={generateWidget}
                  disabled={loading}
                  style={styles.generate}
                  aria-label={loading ? "Generating widget" : "Generate widget"}
                >
                  {loading ? "Generating..." : "Generate"}
                </CButton>
              </CForm>
            </CCol>

            {/* ── Right Column: Widget Code ── */}
            <CCol md={6} className="d-none d-md-block">
              <CFormLabel style={styles.label}>Widget Code</CFormLabel>
              <div style={{ position: "relative" }}>
                <pre style={styles.codeBox}>{scriptText}</pre>
                {scriptText && (
                  <CButton
                    color="secondary"
                    size="sm"
                    onClick={copyToClipboard}
                    style={styles.copyButton}
                    aria-label="Copy widget code to clipboard"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </CButton>
                )}
              </div>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-4" style={styles.buttonGroup}>
            <CButton
              color="light"
              className="me-2"
              onClick={cancelChanges}
              aria-label="Cancel changes"
            >
              Cancel
            </CButton>
            <CButton
              color="primary"
              onClick={saveWidget}
              disabled={loading}
              aria-label="Save changes"
            >
              {loading ? "Saving..." : "Save"}
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {copySuccess && (
        <div style={styles.copyNotification}>Copied to clipboard!</div>
      )}
    </CContainer>
  );
};

const styles = {
  container: { padding: "inherit" },
  cardHeader: {
    position: "sticky",
    top: "0",
    backgroundColor: "#f3f4f7",
    borderBottom: "1px solid #dee2e6",
    zIndex: 10,
  },
  cbody: { minHeight: "70vh", backgroundColor: "#f8f9fa" },
  label: {
    fontWeight: "500",
    marginBottom: "5px",
    display: "block",
  },
  colorBoxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    padding: "4px 10px",
  },
  colorBox: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    padding: 0,
  },
  colorHex: {
    fontSize: "14px",
    color: "#333",
  },
  colorHint: {
    fontSize: "12px",
    color: "#888",
    marginTop: "6px",
  },
  codeBox: {
    backgroundColor: "#e6f0ec",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    height: "200px",
    whiteSpace: "pre-wrap",
    fontSize: "12px",
    color: "#333",
    overflow: "auto",
  },
  generate: {
    backgroundColor: "#74b047",
    color: "#fff",
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  copyButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
  },
  buttonGroup: {
    position: "sticky",
    bottom: "20px",
    zIndex: 10,
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderTop: "1px solid #dee2e6",
  },
  copyNotification: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "6px",
    zIndex: 1050,
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
};

export default WidgetForm;