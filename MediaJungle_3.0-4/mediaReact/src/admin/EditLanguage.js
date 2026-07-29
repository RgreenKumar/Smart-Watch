import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useLocation , Link} from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const EditLanguage = () => {

  const id=localStorage.getItem('items');
  const [updatedlanguage, setUpdatedlanguage] = useState({language:''});
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem('tokenn')

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedlanguage((prevCategory) => ({
      ...prevCategory,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetLanguageById/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUpdatedlanguage(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching language:', error);
        throw error;
      });
  }, [id]);




const handleSubmit = (e) => {
  e.preventDefault();
  const languageId = id;

  fetch(`${API_URL}/api/v2/editLanguage/${languageId}`, {
    method: 'PATCH',
    headers: {
      Authorization:token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedlanguage),
  })
  .then((response) => {
    if (response.ok) {
      console.log('Language updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Language details successfully updated',
      });
    } else {
      console.log('Error updating language');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating language',
      });
    }
  })
  .catch((error) => {
    console.log('Error updating language:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: 'An error occurred while updating the language',
    // });
  });
};

  

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
                      <th>Language</th>
                      <td>
                        <input
                          type="text"
                          name="language"
                          value={updatedlanguage.language}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.username && <div className="error">{errors.language}</div>}
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

export default EditLanguage;