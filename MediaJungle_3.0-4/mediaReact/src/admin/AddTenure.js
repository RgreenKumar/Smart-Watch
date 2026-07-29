import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../Config';

const AddTenure = () => {
    const [tenurename, setTenurename] = useState('');
    const [months, setMonths] = useState('');
    const [discount, setDiscount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedMonths, setSelectedMonths] = useState('');
    const [discountOptions, setDiscountOptions] = useState([]);
    const token = sessionStorage.getItem("tokenn");
    const handleMonthsChange = (e) => {
        const selectedMonths = parseInt(e.target.value, 10); // Convert input to number
        setSelectedMonths(selectedMonths);
    
        // Define discount options based on selected months
        let options = [];
        if (selectedMonths ==1 || selectedMonths ==2){
            options =[0];
        }
        if (selectedMonths >= 3) {
            options = Array.from({ length: selectedMonths + 1 }, (_, i) => i); // Discounts from 0 to selectedMonths
        }
        setDiscountOptions(options);
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            tenure_name: tenurename,
            months:  selectedMonths,
            discount: discount
        };

        console.log('Submitting data:', data); // Log the data being sent

        fetch(`${API_URL}/api/v2/addtenure`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`, // Ensure the token is passed correctly
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            console.log('Response Status:', response.status); // Log response status
            return response.json(); // Parse JSON response
        })
        .then(responseData => {
            console.log('Response Data:', responseData); // Log the response data
            if (responseData.id) {
                // Clear the form fields
                setTenurename('');
                setMonths('');
                setDiscount('');

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Tenure inserted successfully!',
                });
            } else {
                setErrorMessage(responseData.message || 'Error occurred while inserting tenure.');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: responseData.message || 'Error occurred while inserting tenure.',
                });
            }
        })
        .catch(error => {
            setErrorMessage('Error occurred while inserting tenure.');
            console.error('Error:', error); // Log the error
            throw error;
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Error',
            //     text: 'An error occurred while inserting the tenure.',
            // });
        });
    };

    return (
        <div className="marquee-container">
        <div className='AddArea'>
          {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button> */}
        </div><br/>
        <div className='container3 mt-10'>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/admin/TenureList">Tenures</Link></li>
        <li className="breadcrumb-item active text-white">Add Tenures</li>
      </ol>
      <div className="container mt-3">
        {/* <div className="row py-3 my-3 align-items-center"> */}
          {/* <div className="col-md-3">
            <label className="custom-label">Tenure Name</label>
          </div> */}

                    <form className='form-container' onSubmit={handleSubmit}>
                        <div className='modal-body'>
                            <div className='temp'>
                                <div className='col-lg-6'>
                                    <label htmlFor="tenurename">Tenure Name</label>
                                    <input
                                        type="text"
                                        name="tenurename"
                                        id="tenurename"
                                        className="form-control"
                                        value={tenurename}
                                        onChange={(e) => setTenurename(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-lg-6">
                                    <label htmlFor="months">No of Months</label>
                                    <select
                                        name="months"
                                        id="months"
                                        className="form-control"
                                        value={selectedMonths}
                                        onChange={handleMonthsChange}
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
                                <div className='col-lg-6'>
                                    <label htmlFor="discount">Discount</label>
                                    <select
                                        name="discount"
                                        id="discount"
                                        className="form-control"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
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

                                <div className='col-lg-12'>
                                    <div className="d-flex justify-content-center" style={{ marginTop: "10px" }}>
                                        <button
                                            type="submit"
                                            className='text-center btn btn-info'
                                        >
                                            SAVE
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

export default AddTenure;
