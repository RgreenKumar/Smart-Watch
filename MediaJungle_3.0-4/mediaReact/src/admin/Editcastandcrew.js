import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../Config';
import Swal from 'sweetalert2';

const Editcastandcrew = () => {
    const id = localStorage.getItem('items');
    const [getall, setgetall] = useState({});
    const [name, setname] = useState('');
    const [image, setimage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const token = sessionStorage.getItem('tokenn')

    useEffect(() => {
        fetch(`${API_URL}/api/v2/getcast/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setgetall(data);
                setname(data.name);
                if (data.image) {
                    setPreviewImage(`data:image/jpeg;base64,${data.image}`);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                throw error;
            });
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v2/GetThumbnailsforcast/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data) {
                    setPreviewImage(`data:image/jpeg;base64,${data}`);
                } else {
                    console.error('Invalid or empty data received:', data);
                }
            } catch (error) {
                console.error('Error fetching or processing image data:', error);
                throw error;
            }
        };
        fetchData();
    }, [id]);

    const handleNameChange = (e) => {
        setname(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setimage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (image) {
                formData.append('image', image);
            }
            const response = await axios.patch(`${API_URL}/api/v2/updatecastandcrew/${id}`, formData, {
                headers: {
                    Authorization:token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Updated successfully!',
                text: response.data.message, // Replace with your response message
                showConfirmButton: 'OK',
            });
        } catch (error) {
            console.error('Error updating:', error);
            throw error;
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Error',
            //     text: 'Failed to update. Please try again later.', // Customize your error message
            //     showConfirmButton: true
            // });
        }
    };

    return (
        <div className='container2 mt-20'>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">
                    <Link to="/Dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Edit</li>
            </ol>
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="text-center">
                                <h5 className="modal-title mb-4">Update Cast</h5>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control mx-auto"
                                        value={name}
                                        onChange={handleNameChange}
                                        style={{ maxWidth: '300px' }} // Adjust width as needed
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Current Image</label>
                                    {previewImage && (
                                        <img src={previewImage} alt="Preview" className="img-fluid mx-auto d-block mb-3" style={{ maxWidth: '300px' }} />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Upload New Image</label>
                                    <input
                                        type="file"
                                        className="form-control-file mx-auto"
                                        onChange={handleImageChange}
                                        style={{ maxWidth: '300px' }} // Adjust width as needed
                                    />
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-info">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editcastandcrew;
