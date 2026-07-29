import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../Config';

const EditTenure = () => {
    const id = localStorage.getItem('items');
    const navigate = useNavigate(); 
    const [selectedMonths, setSelectedMonths] = useState('');
    const [updatedTenure, setupdatedTenure] = useState({
        tenure_name: '',
        months: '',
        discount: ''
    });
    const [discountOptions, setDiscountOptions] = useState([]);
    const token = sessionStorage.getItem('token');

    const handleMonthsChange = (e) => {
        const selectedMonths = parseInt(e.target.value, 10);
        setSelectedMonths(selectedMonths);
    
        // Define discount options based on selected months
        let options = [];
        if (selectedMonths === 1 || selectedMonths === 2) {
            options = [0];
        } else if (selectedMonths >= 3) {
            options = Array.from({ length: selectedMonths + 1 }, (_, i) => i);
        }
        setDiscountOptions(options);
    };

    useEffect(() => {
        fetch(`${API_URL}/api/v2/tenures/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched tenure data:', data);
                setupdatedTenure(data);

                // Initialize discount options based on fetched data
                handleMonthsChange({ target: { value: data.months } });
            })
            .catch(error => {
                console.error('Error fetching tenure:', error);
                throw error;
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setupdatedTenure(prevTenure => ({
            ...prevTenure,
            [name]: value , // Convert to number if necessary
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
    
        console.log('Submitting data:', updatedTenure);
    
        fetch(`${API_URL}/api/v2/edittenure/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTenure),
        })
        .then(response => response.json())
        .then(responseData => {
            console.log('Response Data:', responseData);
            
            // Assuming `responseData` is the updated `Tenure` object
            if (responseData && responseData.tenure_name === updatedTenure.tenure_name) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Tenure details successfully updated',
                });
                navigate("/admin/TenureList");
            // } else {
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'Error',
            //         text: 'Error updating tenure',
            //     });
            }})
        .catch(error => {
            console.error('Fetch error:', error);
            throw error;
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Error',
            //     text: error.message || 'An error occurred while updating the tenure',
            // });
        });
    };
    
    
    return (
        <div className="marquee-container">
        <div className='AddArea'>
              {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/AdminPlan")}>Add Plan</button> */}
            </div>  <br/>
        <div className='container3 mt-10'>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item"><Link to="/admin/TenureList">Tenures</Link></li>
          <li className="breadcrumb-item active text-white">Edit Tenures</li>
        </ol>
        <div className="container mt-3">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="temp">
                                <div className="col-lg-6">
                                    <label htmlFor="tenure_name">Tenure Name</label>
                                    <input
                                        type="text"
                                        name="tenure_name"
                                        id="tenure_name"
                                        className="form-control"
                                        value={updatedTenure.tenure_name || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-lg-6">
                                    <label htmlFor="months">No of Months</label>
                                    <select
                                        name="months"
                                        id="months"
                                        className="form-control"
                                        value={updatedTenure.months || ''}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handleMonthsChange(e); // Update discount options when months change
                                        }}
                                        required
                                    >
                                        <option value="">Select Months</option>
                                        {[...Array(60).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-6">
                                    <label htmlFor="discount">Discount</label>
                                    <select
                                        name="discount"
                                        id="discount"
                                        className="form-control"
                                        value={updatedTenure.discount || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Discount</option>
                                        {discountOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option} Free Month{option > 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-lg-12">
                                    <div className="d-flex justify-content-center" style={{ marginTop: "10px" }}>
                                        <button
                                            type="submit"
                                            className="text-center btn btn-info"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
     </div>
    );
};

export default EditTenure;
