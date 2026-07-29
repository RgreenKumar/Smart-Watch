import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import API_URL from '../../Config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const ForgetPasswordUser = () => {
    const [getall, setGetAll] = useState('');
    const [email, setEmail] = useState('');
    const [code,setcode] = useState('');
    const [password,setPassword] = useState('');
    const [conformPassword,setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [showCode,setShowCode] = useState(true); // State for toggling password visibility
    const [showwPassword,setShowPassword] =useState(true);
    const [showConfirmPassword,setShowConformPassword] = useState(true);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};
    
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
        
        if (!conformPassword.trim()) {
            newErrors.conformPassword = 'Confirm Password is required';
            isValid = false;
        } else if (password !== conformPassword) {
            newErrors.conformPassword = 'Passwords do not match';
            isValid = false;
        }
    
        setErrors(newErrors); // Update the state with new errors
        return isValid;
    };


    const toggleCodeVisibility = () => {
        setShowCode((prevShowcode) => !prevShowcode);
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);  
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConformPassword((prevShowConfirmPassword)=>!prevShowConfirmPassword);
    };

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
                console.log(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
    throw error;

            });
    }, []);


    const nextStep = () => {
        setCurrentStep(currentStep + 1);
      };


    const SendEmail = async (e) => {
        e.preventDefault();
        console.log('Email submitted:', email);
    
        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        // Check if email is valid
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return; // Stop the function if email is invalid
        }
    
        const data = new FormData();
        data.append('email', email);
    
        // Show a success toast indicating the process is starting
        const toastId = toast.success('Verification code is being sent to your email...');
    
        try {
            const senddata = await axios.post(`${API_URL}/api/v2/send-code/forgetpassword`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            // Dismiss the initial toast after 5 seconds (5000ms)
            setTimeout(() => {
                toast.dismiss(toastId);
                if (senddata.status === 201) {
                    console.log(senddata);
                    // Show success toast after the initial one is dismissed
                    toast.success('Email sent successfully!');
    
                    // Move to the next step only if the API call succeeds
                    if (currentStep === 1) {
                        nextStep(); // Navigate to the next page
                    }
                }
            }, 1000);  // Delay of 5 seconds before dismissing the initial toast and showing the success message
    
        } catch (error) {
            console.error('Error:', error);

            setTimeout(() => {
                toast.dismiss(toastId);
            // Check if the error response is available
            if (error.response) {
                // You can access the response data here
                console.log('Error response:', error.response.data);  // This will log 'Invalid email' or other error messages
    
                // Show error toast after the initial one is dismissed
                toast.error(error.response.data || 'An error occurred while sending the verification code.');
            } else {
                // If no response, handle general network errors
                toast.error('An unexpected error occurred. Please try again.');
            }
            }, 3000);  // Delay of 5 seconds before removing the toast
    throw error;

        }
    };

    const SendVerifyCode  = async (e) => {
        e.preventDefault();
        console.log('Email submitted:', email);
    
        const data = new FormData();
        data.append('email', email);
        data.append('code',code);
    
        try {
            const senddata = await axios.post(`${API_URL}/api/v2/verify-code`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (senddata.status === 200) {
                // Set a timer to show the toast message after a short delay
                console.log(senddata);
                setTimeout(() => {
                    toast.success(senddata.data.message);
                }, 1000); // Adjust time (1000ms = 1 second)
                
                // Move to the next step
                
            }
            nextStep();
        }
        catch (error) {
                    // Extract status and message from the error response
                    const status = error.response?.status;
                    const message = error.response?.data?.message || 'An unexpected error occurred.';
            
                    // Handle specific statuses
                    if (status === 400) {
                        setTimeout(() => {
                            toast.warning(message);
                        }, 1000); // Adjust time (1000ms = 1 second)
                    } else if (status === 500) {
                        setTimeout(() => {
                            toast.error(message);
                        }, 1000); // Adjust time (1000ms = 1 second)
                    // } else {
                        // setTimeout(() => {
                        //     toast.error(message);
                        // }, 1000); // Adjust time (1000ms = 1 second)
                    }
                    return false; // Indicate verification failure
    throw error;

                }
            };



    const handleSubmit = async (e) => {
                e.preventDefault();

                if (!validateForm()) return; // Ensure form validation before proceeding
        
                try {
                    const sendData = {
                        email: email,
                        password: password,
                    };
        
                    const response = await fetch(`${API_URL}/api/v2/forgetPassword`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(sendData),
                    });
        
                    if (response.ok) {
                        // Show alert message
                        toast.success("Password changed successfully! Redirecting to login page...");
        
                        // Redirect after showing the alert
                        
                            navigate('/UserLogin');
                    } else {
                        // Handle errors here
                        const errorData = await response.json();
                        toast.error(errorData.message);
                    }
                } catch (error) {
                    // Handle exceptions here
                    console.error("An error occurred", error);
    throw error;

                }
            };
            

    return (
        <Layout>
            <div className="forgot-password-container">
            {currentStep === 1 && (
            <>
                <div className="form-box">
                    <a href="/Userlogin" className="back-to-login">
                        &lt; Back to login
                    </a>
                    {getall.length > 0 && getall[0].logo ? (
                        <img
                            src={`data:image/png;base64,${getall[0].logo}`}
                            alt="logo"
                            className="logoimage"
                        />
                    ) : (
                        <div></div>
                    )}
                    <span>Sign In</span>
                    <span className="forgot">Forgot your password?</span>
                    <form className="formfield" onSubmit={SendEmail}>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            placeholder="Email or mobile number"
                            className="input-field"
                            onChange={(e) => setEmail(e.target.value)} // Corrected here
                        />
                        <button type="submit" className="submit-verifybutton">
                            Submit
                        </button>
                    </form>
                </div>
                </>

            )}

            {currentStep == 2 &&(
                <>
                <div className="form-box">
                    <a href="/Userlogin" className="back-to-login">
                        &lt; Back to login
                    </a>
                    {getall.length > 0 && getall[0].logo ? (
                        <img
                            src={`data:image/png;base64,${getall[0].logo}`}
                            alt="logo"
                            className="logoimage"
                        />
                    ) : (
                        <div></div>
                    )}
                    <span>Sign In</span>
                    <span className="forgot">Verify code</span>
                    <span className="forgot1">An authendication code has been sent to your email</span>
                    <form className="formfield" onSubmit={SendVerifyCode}>
                    <div className="input-container">
                <input
                    type={showCode ? "password" : "text"} // Toggle between text and password
                    name="code"
                    value={code}
                    placeholder="Enter the OTP"
                    className="input-field"
                    onChange={(e) => setcode(e.target.value)}
                />
                <i
                    className={`bi ${showCode ? 'bi-eye-slash' : 'bi-eye'} eye-icon`} // Bootstrap icons
                    onClick={toggleCodeVisibility}
                ></i>
            </div>
                        <span className='resend'>Don't Receive a code?<span className='resend1' onClick={SendEmail}> Resend</span></span>
                        <button type="submit" className="submit-verifybutton">
                            Submit
                        </button>
                    </form>
                </div>
                </>
            )}

{currentStep === 3 && (
            <>
            <div className="form-box">
                    <a href="/Userlogin" className="back-to-login">
                        &lt; Back to login
                    </a>
                    {getall.length > 0 && getall[0].logo ? (
                        <img
                            src={`data:image/png;base64,${getall[0].logo}`}
                            // src={`${API_URL}/api/v2/logo/1`}
                            alt="logo"
                            className="logoimage"
                        />
                    ) : (
                        <div></div>
                    )}
                    <span>Sign In</span>
                    <span className="forgot">Set a Password</span>
                    <span className="forgot1">Your previous password has been reseted. Please set a new password for your account</span>
                    <form className="formfield" onSubmit={handleSubmit}>
                    <div className="input-container">
                <input
                    type={showwPassword? "password" : "text"} // Toggle between text and password
                    name="code"
                    value={password}
                    placeholder="Enter the New Password"
                    className="input-field"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <i
                    className={`bi ${showwPassword ? 'bi-eye-slash' : 'bi-eye'} password-eye-icon`} // Bootstrap icons
                    onClick={togglePasswordVisibility}
                ></i>
                {errors.password && (
                            <p style={{color:'red'}}>{errors.password}</p>
                        )}
                <input
                    type={showConfirmPassword ? "password" : "text"} // Toggle between text and password
                    name="code"
                    value={conformPassword}
                    placeholder="Confirm Password"
                    className="input-field"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.conformPassword && (
                            <p style={{color:'red'}}>{errors.conformPassword}</p>
                        )}
                <i
                    className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} confirm-eye-icon`} // Bootstrap icons
                    onClick={toggleConfirmPasswordVisibility}
                ></i>
            </div>
                        <button type="submit" className="submit-verifybutton">
                            Submit
                        </button>
                    </form>
                </div>
            
            </>
)}
            </div>
            
        </Layout>
    )
}

export default ForgetPasswordUser