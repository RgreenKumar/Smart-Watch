import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';
import Swal from 'sweetalert2';

const TenureList = () => {
    const navigate = useNavigate();
    const [tenures, setTenures] = useState([]); // Use this state for tenures

    const token = sessionStorage.getItem('tokenn')
    
    const handleDelete = (id) => {
        // Display confirmation dialog using SweetAlert
        Swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this Tenure!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            // User confirmed deletion, proceed with fetch DELETE request
            fetch(`${API_URL}/api/v2/deletetenure/${id}`, {
              method: 'DELETE',
              headers:{
                Authorization:token
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.status <= 204 ? null : response.json();
            })
            .then(data => {
              if (!data) {
                console.log('Tenure deleted successfully');
                // Remove the deleted tenure from the local state
                setTenures(prevTenure => prevTenure.filter(tenure => tenure.id !== id));
                Swal.fire(
                  'Deleted!',
                  'Your Tenure has been deleted.',
                  'success'
                );
              // } else {
              //   console.error('Error deleting tenure:', data.error); // Log error message from server
              //   Swal.fire(
              //     'Error!',
              //     'Failed to delete tenure. Please try again later.',
              //     'error'
              //   );
              }
            })
            .catch(error => {
              console.error('Error deleting tenure:', error);
              // Swal.fire(
              //   'Error!',
              //   'Failed to delete tenure. Please try again later.',
              //   'error'
              // );
              throw error;
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Delete operation cancelled');
          }
        });
      };
    
    useEffect(() => {
        fetch(`${API_URL}/api/v2/tenures`)
          .then(response => {
            console.log(response);
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("Fetched data:", data);
            setTenures(data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            throw error;
          });
    }, []);

    return (
        <div className="marquee-container">
            <div className='AddArea'>
                <button className='btn btn-custom' onClick={() => navigate("/admin/AddTenure")}>Add Tenure</button>
            </div>
            <br />
            
            <div className='container3'>
                <ol className="breadcrumb mb-4 d-flex  my-0">
                    <li className="breadcrumb-item text-white">
                        <Link to="/admin/TenureList">Tenures</Link>
                    </li>
                    <li className="ms-auto text-end text-white">
          Bulk Action
          <button className="ms-2">
            <i className="bi bi-chevron-down"></i>
          </button>
        </li>
                </ol>
                <div className="table-container">
                <table class="table table-striped">
                        <thead>
                            <tr className='table-header'>
                            < th style={{border: 'none' }}>
                <input type="checkbox" />
              </th>
                                <th style={{border: 'none' }}>S.No</th>
                                <th style={{border: 'none' }}>Tenure Name</th>
                                <th style={{border: 'none' }}>No of Months</th>
                                <th style={{border: 'none' }}>Discount Months</th>
                                <th style={{border: 'none' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenures.length > 0 ? (
                                tenures.map((tenure, index) => (
                                    <tr key={tenure.id}>
                                        <td>
                  <input type="checkbox" />
                </td>
                                        <td className='truncate' title={index}>{index + 1}</td> {/* Display serial number */}
                                        <td className='truncate' title={tenure.tenure_name}>{tenure.tenure_name.length> 15 ? `${tenure.tenure_name.substring(0, 10)}...` : tenure.tenure_name}</td>
                                        <td className='truncate' title={tenure.months}>{tenure.months.length> 15 ? `${tenure.months.substring(0, 10)}...` : tenure.months}</td>
                                        <td className='truncate' title={tenure.discount}>{tenure.discount.length> 15 ? `${tenure.discount.substring(0, 10)}...` : tenure.discount}</td>
                                        <td>
                                            <button className="btn btn-primary me-2" onClick={() => handleEdit(tenure.id)}>
                                              <i className="fas fa-edit" aria-hidden="true"></i>  Edit
                                            </button>
                                            <button  className="btn btn-danger" onClick={() => handleDelete(tenure.id)}>
                                                <i className="fa fa-trash" aria-hidden="true"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No tenures available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    function handleEdit(id) {
        // Navigate to edit page or perform edit action
        localStorage.setItem('items', id);
        navigate(`/admin/EditTenure/${id}`);
    }
};

export default TenureList;
