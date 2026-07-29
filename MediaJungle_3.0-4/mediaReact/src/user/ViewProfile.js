import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Layout from './Layout/Layout';
import { FiLogIn } from 'react-icons/fi';
import { FaPen } from 'react-icons/fa';
import API_URL from '../Config';
import Swal from 'sweetalert2';

const ViewProfile = () => {
    const jwtToken = sessionStorage.getItem("token");
    const userId = Number(sessionStorage.getItem("userId"));

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        mobnum: '',
    });

    const loadProfileImage = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v2/GetProfileImage/${userId}`);
            if (!response.ok) {
                // ✅ FIX 1: Removed "throw new Error('Image not found')" inside try
                // and removed "throw error" in catch — image missing is not a fatal error.
                setImageSrc(null);
                return;
            }

            const imageBlob = await response.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setImageSrc(imageObjectURL);
            return () => URL.revokeObjectURL(imageObjectURL);
        } catch (err) {
            // ✅ FIX 2: Removed "throw error" — just log and show placeholder instead of crashing
            console.error('Error fetching image:', err);
            setImageSrc(null);
        }
    };

    useEffect(() => {
        loadProfileImage();
    }, [userId]);

    useEffect(() => {
        if (!jwtToken) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/api/v2/GetUserById/${userId}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch user');
                return response.json();
            })
            .then(data => {
                setUser(data);
                setEditData({ username: data.username, email: data.email, mobnum: data.mobnum });
                setLoading(false);
            })
            .catch(error => {
                // ✅ FIX 3: Removed "throw error" — error is already handled via setError()
                console.error('Error fetching user details:', error);
                setError(error.message);
                setLoading(false);
            });
    }, [jwtToken, userId]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            const imageURL = URL.createObjectURL(file);
            setImageSrc(imageURL);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleSaveChanges = async () => {
        const formData = new FormData();
        formData.append('username', editData.username);
        formData.append('email', editData.email);
        formData.append('mobnum', editData.mobnum);
        if (newImage) {
            formData.append('profileImage', newImage);
        }

        try {
            const response = await fetch(`${API_URL}/api/v2/updateUser/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': jwtToken,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to update user details');

            Swal.fire({
                icon: 'success',
                title: 'Profile updated successfully',
                confirmButtonColor: '#FFC107',
            });

            await loadProfileImage();
            setUser(editData);
            setEditMode(false);
        } catch (error) {
            // ✅ FIX 4: Removed "throw error" and uncommented Swal error alert
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to update profile',
                text: 'Please try again later.',
            });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Layout className='container mx-auto min-h-screen overflow-y-auto'>
            <div className='banner-container px-10 my-24 flex flex-col items-center'>
            <div className="relative mb-6 flex justify-center">
    {imageSrc ? (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-600">
            <img src={imageSrc} alt="User Profile" className="w-full h-full object-cover" />
        </div>
    ) : (
        <div className="relative w-32 h-32 bg-gray-200 rounded-full flex justify-center items-center text-gray-500 border-4 border-yellow-600">
            <span>No Image</span>
        </div>
    )}
    <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="fileInput"
        onChange={handleImageChange}
    />
      {editMode ? (
                    <label
                        htmlFor="fileInput"
                        className="absolute bottom-4 right-6 transform translate-x-1/2 translate-y-1/2 bg-white p-2 rounded-full shadow-lg cursor-pointer z-20"
                        onClick={handleEditClick}
                    >
                        <FaPen className="text-yellow-600" />
                    </label>):<label></label>}

</div>

                {jwtToken && user ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 text-white">Name:</td>
                                    <td className="px-4 py-2 text-white">
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="username"
                                                value={editData.username}
                                                onChange={handleInputChange}
                                                className="bg-gray-200 p-1 rounded text-black"
                                            />
                                        ) : (
                                            user.username
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 text-white">Email:</td>
                                    <td className="px-4 py-2 text-white">
                                        {editMode ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editData.email}
                                                onChange={handleInputChange}
                                                className="bg-gray-200 p-1 rounded text-black"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 text-white">Phone Number:</td>
                                    <td className="px-4 py-2 text-white">
                                        {editMode ? (
                                            <input
                                                type="tel"
                                                name="mobnum"
                                                value={editData.mobnum}
                                                onChange={handleInputChange}
                                                className="bg-gray-200 p-1 rounded text-black"
                                            />
                                        ) : (
                                            user.mobnum
                                        )}
                                    </td>
                                </tr>
                                {!editMode && (
                                    <tr>
                                        <td colSpan="2" className="px-4 py-2 text-white text-center">
                                            <button className='btn btn-primary' onClick={handleEditClick}>
                                                Edit Profile
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {editMode && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={handleSaveChanges}
                                    className='bg-green-500 text-white p-2 rounded-lg text-sm hover:bg-green-700 mx-2'
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className='bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-700 mx-2'
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <NavLink to='/UserLogin' className='bg-subMain transitions hover:bg-main flex-rows gap-4 text-white p-4 rounded-lg w-full text-center'>
                        <FiLogIn /> Sign In
                    </NavLink>
                )}
            </div>
        </Layout>
    );
};

export default ViewProfile;