import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { Input } from '../Components/UsedInputs';
import { FiUpload } from 'react-icons/fi';
import API_URL from '../../Config';
import { useNavigate } from 'react-router-dom';


const Userforgetpassword = () => {
    const [getall, setGetAll] = useState('');
    const [user, setUser] = useState({ email: '', password: '', confirmPassword: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
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
                // Do NOT rethrow — prevents unhandled promise rejection
                console.error('Error fetching data:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation: confirm passwords match
        if (user.password !== user.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            const sendData = {
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword,
            };

            const response = await fetch(`${API_URL}/api/v2/forgetPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sendData),
            });

            if (response.ok) {
                // Clear user data from session storage
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('name');

                // Show alert message
                alert("Password changed successfully! Redirecting to login page...");

                // Redirect after showing the alert
                setTimeout(() => {
                    navigate('/UserLogin');
                }, 2000);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            // Do NOT rethrow — show user-friendly error instead
            console.error("An error occurred", error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        // ✅ FIX: <Layout> is now the top-level element, NOT wrapped by <form>
        // This prevents the "nested <form>" DOM warning
        <Layout>
            <div className='container mx-auto flex-colo'>
                <div className='w-full 2xl:w-2/5 gap-8 flex-colo p-8 sm:p-14 md:w-2/5 rounded-lg border border-border' style={{
                    background: 'linear-gradient(to top, #141335, #0c0d1a)',
                }}>
                    {getall.length > 0 && getall[0].logo ? (
                        <img
                            src={`data:image/png;base64,${getall[0].logo}`}
                            alt='logo'
                            className='mx-auto h-16 object-contain mb-6'
                        />
                    ) : (
                        <div></div>
                    )}

                    {/* ✅ FIX: <form> is now INSIDE <Layout>, not wrapping it */}
                    <form onSubmit={handleSubmit} className='w-full flex flex-col gap-6'>
                        <Input
                            label="Email"
                            placeholder="newtonmedia@gmail.com"
                            type='email'
                            bg={true}
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="New Password"
                            placeholder="************"
                            type='password'
                            bg={true}
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            placeholder="************"
                            type='password'
                            bg={true}
                            name="confirmPassword"
                            value={user.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type='submit'
                            className='bg-subMain transitions hover:bg-main flex-rows gap-4 text-white p-4 rounded-lg w-full mt-4'
                        >
                            <FiUpload /> Update Password
                        </button>

                        {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Userforgetpassword;