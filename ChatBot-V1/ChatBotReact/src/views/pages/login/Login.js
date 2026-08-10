import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'
import API_URL from '../../../Config'

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loginError, setLoginError] = useState('') // for backend error messages
  const navigate = useNavigate()

  // Inline errors — only shown after field is touched
  const errors = {
    email: touched.email && !email
      ? 'Email is required.'
      : touched.email && !validateEmail(email)
      ? 'Enter a valid email address.'
      : '',
    password: touched.password && !password
      ? 'Password is required.'
      : '',
  }

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const handleLogin = async () => {
    setTouched({ email: true, password: true })
    setLoginError('') // clear previous backend error

    if (!email) {
      toast.error('Email is required!')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Enter a valid email address!')
      return
    }

    if (!password) {
      toast.error('Password is required!')
      return
    }

    try {
      const response = await axios.post(`${API_URL}/chatbot/login`, {
        email,
        password,
      })

      const data = response.data
      console.log(data)

      if (data.token) {
        toast.success('Login successful!')
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('name', data.name)
        sessionStorage.setItem('email', data.email)
        sessionStorage.setItem('userid', data.userId)
        sessionStorage.setItem('role', data.role)
        navigate('/')
      } else {
        // Backend returned 200 but no token — show backend message
        const msg = data.message || 'Invalid email or password!'
        setLoginError(msg)
        toast.error(msg)
      }
    } catch (error) {
      // Backend returned 4xx/5xx — show backend error message
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Invalid email or password!'
      setLoginError(msg)
      toast.error(msg)
      console.error('Login Error:', error)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleLogin()
                    }}
                  >
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {/* Email Input */}
                    <CInputGroup className="mb-1">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setLoginError('') // clear backend error on change
                        }}
                        onBlur={() => handleBlur('email')}
                        invalid={!!errors.email}
                      />
                    </CInputGroup>
                    {errors.email && (
                      <div className="mb-2" style={{ color: '#dc3545', fontSize: '0.82rem', paddingLeft: '4px' }}>
                        {errors.email}
                      </div>
                    )}

                    {/* Password Input */}
                    <CInputGroup className="mb-1 mt-2">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setLoginError('') // clear backend error on change
                        }}
                        onBlur={() => handleBlur('password')}
                        invalid={!!errors.password || !!loginError}
                      />
                      <CInputGroupText
                        role="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </CInputGroupText>
                    </CInputGroup>
                    {errors.password && (
                      <div className="mb-2" style={{ color: '#dc3545', fontSize: '0.82rem', paddingLeft: '4px' }}>
                        {errors.password}
                      </div>
                    )}

                    {/* Backend error (wrong password / user not found) */}
                    {loginError && !errors.password && (
                      <div className="mb-2" style={{ color: '#dc3545', fontSize: '0.82rem', paddingLeft: '4px' }}>
                        {loginError}
                      </div>
                    )}

                    {/* Buttons */}
                    <CRow className="mt-3">
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Sign up Side */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Don't have an account? Register now to access the dashboard and chatbot.
                    </p>
                    <Link to="/register">
                      <CButton color="light" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login