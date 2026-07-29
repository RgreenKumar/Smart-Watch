import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../Config';

const EditCertificate = () => {
  const id = localStorage.getItem('items');
  const [updatedcertificate, setUpdatedcertificate] = useState({ certificate: '' });
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem('tokenn')

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedcertificate((prevCertificate) => ({
      ...prevCertificate,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetCertificateById/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUpdatedcertificate(data);
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching certificate:', error);
    throw error;

      });
  }, [id]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const certificateId = id; // Assuming id is defined elsewhere
    fetch(`${API_URL}/api/v2/editCertificate/${certificateId}`, {
      method: 'PATCH',
      headers: {
        Authorization:token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedcertificate),
    })
    .then((response) => {
      if (response.ok) {
        console.log('Certificate updated successfully');
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Certificate details successfully updated',
        });
      } else {
        console.log('Error updating certificate');
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: 'Error updating certificate',
        // });
      }
    })
    .catch((error) => {
      console.log('Error updating certificate:', error);
    throw error;

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'An error occurred while updating the certificate',
      // });
    });
  };
  

  if (!updatedcertificate) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container2 mt-20'>
        
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/Dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active">Edit</li>
        </ol>
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Certificate</th>
                        <td>
                          <input
                            type="text"
                            name="certificate"
                            value={updatedcertificate.certificate}
                            onChange={handleChange}
                            className="form-control"
                          />
                          {errors.certificate && <div className="error">{errors.certificate}</div>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button type="submit" className="btn btn-info">
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EditCertificate;