import React, { useState, useEffect } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser, cilEnvelopeClosed } from "@coreui/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../../../Config";

const EyeIcon = ({ visible }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#6c757d"
    strokeWidth={1.8}
    style={{ display: "block" }}
  >
    {visible ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.94 10.94 0 0112 19C5 19 1 12 1 12a18.1 18.1 0 015.06-5.94M9.9 4.24A9.77 9.77 0 0112 4c7 0 11 8 11 8a18.15 18.15 0 01-2.16 3.19M6.53 6.53A9.956 9.956 0 001 12s4 7 11 7a9.956 9.956 0 005.47-1.53" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 104.24 4.24" />
        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    repeatPassword: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const token = hashParams.get("token");

    if (token) {
      axios
        .get(`${API_URL}/chatbot/register-token/${token}`)
        .then((res) => {
          setEmail(res.data.email);
          setRole(res.data.role);
          setIsPreFilled(true);
        })
        .catch(() => {
          toast.error("Invalid or expired registration link.");
          navigate("/404");
        });
    }
  }, []);

  const errors = {
    name: touched.name && !name.trim() ? "Name is required." : "",
    email:
      touched.email && !email
        ? "Email is required."
        : touched.email && !validateEmail(email)
        ? "Enter a valid email address."
        : "",
    password:
      touched.password && !password
        ? "Password is required."
        : touched.password && password.length < 6
        ? "Password must be at least 6 characters."
        : "",
    repeatPassword:
      touched.repeatPassword && !repeatPassword
        ? "Please confirm your password."
        : touched.repeatPassword && repeatPassword !== password
        ? "Passwords do not match."
        : "",
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true, repeatPassword: true });

    // Validate directly — don't rely on errors object here
    if (!name.trim()) {
      toast.dismiss();
      toast.error("Name is required!");
      return;
    }

    if (!email) {
      toast.dismiss();
      toast.error("Email is required!");
      return;
    }

    if (!validateEmail(email)) {
      toast.dismiss();
      toast.error("Enter a valid email address!");
      return;
    }

    if (!password) {
      toast.dismiss();
      toast.error("Password is required!");
      return;
    }

    if (password.length < 6) {
      toast.dismiss();
      toast.error("Password must be at least 6 characters!");
      return;
    }

    if (!repeatPassword) {
      toast.dismiss();
      toast.error("Please confirm your password!");
      return;
    }

    if (password !== repeatPassword) {
      toast.dismiss();
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      const response = await axios.post(`${API_URL}/chatbot/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("User registered successfully");
        navigate("/login");
      } else {
        toast.error(response.data || "Registration failed!");
      }
    } catch (error) {
      toast.error(error.response?.data || "Error registering user!");
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>

                  {/* Name */}
                  <CInputGroup className="mb-1">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                      autoComplete="name"
                      invalid={!!errors.name}
                    />
                  </CInputGroup>
                  {errors.name && (
                    <div className="mb-2" style={{ color: "#dc3545", fontSize: "0.82rem", paddingLeft: "4px" }}>
                      {errors.name}
                    </div>
                  )}

                  {/* Email */}
                  <CInputGroup className="mb-1 mt-2">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeClosed} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      type="email"
                      value={email}
                      disabled={isPreFilled}
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      invalid={!!errors.email}
                    />
                  </CInputGroup>
                  {errors.email && (
                    <div className="mb-2" style={{ color: "#dc3545", fontSize: "0.82rem", paddingLeft: "4px" }}>
                      {errors.email}
                    </div>
                  )}

                  {/* Password */}
                  <CInputGroup className="mb-1 mt-2">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      autoComplete="new-password"
                      invalid={!!errors.password}
                    />
                    <CInputGroupText
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{ cursor: "pointer", background: "transparent", borderLeft: "none" }}
                    >
                      <EyeIcon visible={showPassword} />
                    </CInputGroupText>
                  </CInputGroup>
                  {errors.password && (
                    <div className="mb-2" style={{ color: "#dc3545", fontSize: "0.82rem", paddingLeft: "4px" }}>
                      {errors.password}
                    </div>
                  )}

                  {/* Repeat Password */}
                  <CInputGroup className="mb-1 mt-2">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      onBlur={() => handleBlur("repeatPassword")}
                      autoComplete="new-password"
                      invalid={!!errors.repeatPassword}
                    />
                    <CInputGroupText
                      onClick={() => setShowRepeatPassword((prev) => !prev)}
                      style={{ cursor: "pointer", background: "transparent", borderLeft: "none" }}
                    >
                      <EyeIcon visible={showRepeatPassword} />
                    </CInputGroupText>
                  </CInputGroup>
                  {errors.repeatPassword && (
                    <div className="mb-2" style={{ color: "#dc3545", fontSize: "0.82rem", paddingLeft: "4px" }}>
                      {errors.repeatPassword}
                    </div>
                  )}

                  <div className="d-grid mt-3">
                    <CButton color="success" onClick={handleRegister}>
                      Create Account
                    </CButton>
                  </div>

                  <div className="text-center mt-3">
                    <p>
                      Already have an account?{" "}
                      <a href="/login" className="text-decoration-none">
                        Login
                      </a>
                    </p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;