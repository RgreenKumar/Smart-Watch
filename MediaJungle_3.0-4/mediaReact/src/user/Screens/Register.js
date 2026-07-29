import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import axios from 'axios';
import API_URL from '../../Config';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register = () => {
    const [username, setusername] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [confirmpassword, setconfirmpassword] = useState('');
    const [mobilenumber, setmobilenumber] = useState('');
    const [code, setcode] = useState('');
    const [errors, setErrors] = useState({});
    const [getall, setGetAll] = useState('');
    const [verifyresponse, setverifyresponse] = useState('false');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/api/v2/GetsiteSettings`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setGetAll(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Do NOT rethrow — prevents unhandled promise rejection
            });
    }, []);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6 || password.length > 15) {
            newErrors.password = 'Password must be between 6 and 15 characters';
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            newErrors.password = 'Password must contain at least one special character';
            isValid = false;
        }

        if (!confirmpassword.trim()) {
            newErrors.confirmpassword = 'Confirm Password is required';
            isValid = false;
        } else if (password !== confirmpassword) {
            newErrors.confirmpassword = 'Passwords do not match';
            isValid = false;
        }

        if (!mobilenumber.trim()) {
            newErrors.mobilenumber = 'Mobile number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(mobilenumber)) {
            newErrors.mobilenumber = 'Invalid mobile number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const SendCode = async (e) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }
        setErrors(newErrors);

        if (!isValid) return;

        const data = new FormData();
        data.append('email', email);

        try {
            Swal.fire({
                title: 'Sending...',
                text: 'Please wait while we send the verification code.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const sendCodeResponse = await axios.post(
                `${API_URL}/api/v2/send-code`,
                data,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            Swal.close();

            Swal.fire({
                icon: 'success',
                title: 'Verification code sent!',
                text: sendCodeResponse.data,
            });
        } catch (sendError) {
            Swal.close();

            if (sendError.response) {
                const status = sendError.response.status;
                const backendMessage = sendError.response.data;

                if (status === 409) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Conflict',
                        text: backendMessage || 'The email is already registered.',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/UserLogin');
                        }
                    });
                } else if (status === 400) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Bad Request',
                        text: backendMessage || 'Failed to send verification code. Please try again.',
                    });
                } else if (status === 500) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Server Error',
                        text: backendMessage || 'An internal server error occurred.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unexpected Error',
                        text: backendMessage || 'An unexpected error occurred. Please try again.',
                    });
                }
            } else {
                // Network error — no response from server
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Failed to connect to the server. Please check your connection.',
                });
            }
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        const verifyData = new FormData();
        verifyData.append('email', email);
        verifyData.append('code', code);

        try {
            const verifyResponse = await axios.post(`${API_URL}/api/v2/verify-code`, verifyData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: verifyResponse.data.message || 'Verification successful!',
            });

            setverifyresponse('yes');
            return true;
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.message || 'An unexpected error occurred.';

            if (status === 400) {
                Swal.fire({ icon: 'warning', title: 'Warning', text: message });
                setErrors({ code: message });
            } else if (status === 500) {
                Swal.fire({ icon: 'error', title: 'Error', text: message });
                setErrors({ code: message });
            } else {
                // Handle other errors gracefully — do NOT rethrow
                setErrors({ code: message });
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message,
                });
            }
            return false;
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("confirmPassword", confirmpassword);
            formData.append("mobnum", mobilenumber);

            const registrationResponse = await axios.post(
                `${API_URL}/api/v2/userregister`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (registrationResponse.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registered successfully',
                    text: 'You are now registered. Redirecting to login...',
                    confirmButtonColor: '#FFC107',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/UserLogin');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration failed',
                    text: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Do NOT rethrow — show user-friendly error instead
            Swal.fire({
                icon: 'error',
                title: 'Operation Failed',
                text: error.response?.data || 'An error occurred. Please try again.',
            });
        }
    };

    return (
        <Layout>
            <div className='forgot-password-container'>
                <div className="register-box">
                    {getall.length > 0 && getall[0].logo ? (
                        <img
                            src={`data:image/png;base64,${getall[0].logo}`}
                            alt="logo"
                            className="logoimage"
                        />
                    ) : (
                        <div></div>
                    )}
                    <span>Sign Up</span>
                    <form className="registerfield" onSubmit={submitForm}>
                        <label>User Name</label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            placeholder="User Name"
                            className="register-field"
                            onChange={(e) => setusername(e.target.value)}
                        />
                        {errors.username && (
                            <p style={{ color: 'red' }}>{errors.username}</p>
                        )}

                        <label>Email</label>
                        <div className="otp-container">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                placeholder="Enter your email"
                                className="register-field"
                                disabled={verifyresponse === 'yes'}
                                onChange={(e) => setemail(e.target.value)}
                            />
                            <button
                                className="get-otp-button"
                                disabled={!email || verifyresponse === 'yes'}
                                onClick={SendCode}
                            >
                                Get OTP
                            </button>
                        </div>
                        {errors.email && (
                            <p style={{ color: 'red' }}>{errors.email}</p>
                        )}

                        <div className="verify-container">
                            <input
                                type="text"
                                name="code"
                                value={code}
                                placeholder="Enter OTP code"
                                className="register-field"
                                disabled={verifyresponse === 'yes'}
                                onChange={(e) => setcode(e.target.value)}
                            />
                            {errors.code && (
                                <p style={{ color: 'red' }}>{errors.code}</p>
                            )}
                            {verifyresponse === 'yes' ? (
                                <span className="get-tick-button">&#10004;</span>
                            ) : (
                                <button
                                    className="get-verify-button"
                                    disabled={!code || verifyresponse === 'yes'}
                                    onClick={verifyCode}
                                >
                                    Verify
                                </button>
                            )}
                        </div>

                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            className="register-field"
                            onChange={(e) => setpassword(e.target.value)}
                        />
                        {errors.password && (
                            <p style={{ color: 'red' }}>{errors.password}</p>
                        )}

                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmpassword"
                            value={confirmpassword}
                            placeholder="Confirm Password"
                            className="register-field"
                            onChange={(e) => setconfirmpassword(e.target.value)}
                        />
                        {errors.confirmpassword && (
                            <p style={{ color: 'red' }}>{errors.confirmpassword}</p>
                        )}

                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="mobilenumber"
                            value={mobilenumber}
                            placeholder="Phone Number"
                            className="register-field"
                            onChange={(e) => setmobilenumber(e.target.value)}
                        />
                        {errors.mobilenumber && (
                            <p style={{ color: 'red' }}>{errors.mobilenumber}</p>
                        )}

                        <button
                            type="submit"
                            className={`submit-registerbutton ${verifyresponse === 'false' ? 'disabled-button' : ''}`}
                            disabled={verifyresponse === 'false'}
                        >
                            Sign Up
                        </button>
                        <span>
                            Already have an account?{' '}
                            <Link to="/Userlogin">
                                <span style={{ textDecoration: 'underline' }}>Signin</span>
                            </Link>
                        </span>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Register;