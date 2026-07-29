import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const ViewLanguage = () => {

  const navigate = useNavigate();
  const [language, setlanguage] = useState([]);
  const token = sessionStorage.getItem('tokenn')

  const handleClick = (link) => {
    localStorage.removeItem('items'); // Clear the stored videoId
    navigate(link);
  }


  useEffect(() => {
    // fetch category data from the backend
    fetch(`${API_URL}/api/v2/GetAllLanguage`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setlanguage(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);





const handleDeleteLanguage = (languageId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to delete this language. This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/api/v2/DeleteLanguage/${languageId}`, {
        method: 'DELETE',
        headers:{
          Authorization:token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // If the response status is OK, don't attempt to parse JSON from an empty response
        return response.status === 204 ? null : response.json();
      })
      .then(data => {
        if (!data) {
          console.log('Language deleted successfully');
          // Remove the deleted language from the local state
          setlanguage(prevLanguages => prevLanguages.filter(language => language.id !== languageId));
          Swal.fire(
            'Deleted!',
            'Your language has been deleted.',
            'success'
          );
        } else {
          console.error('Error deleting language:', data.error); // Log error message from server
          // Swal.fire(
          //   'Error!',
          //   `Failed to delete language: ${data.error}`,
          //   'error'
          // );
        }
      })
      .catch(error => {
        console.error('Error deleting language:', error);
        throw error;
        // Swal.fire(
        //   'Error!',
        //   'There was a problem deleting your language. Please try again later.',
        //   'error'
        // );
      });
    }
  });
};


  const handlEdit = async (languageId) => {
    localStorage.setItem('items', languageId);
    navigate('/admin/Addlanguage');
  };
  
  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <button className='btn btn-custom' onClick={() => handleClick("/admin/AddLanguage")}>Add Language</button>
      </div><br/>
      <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex  my-0">
          <li className="breadcrumb-item text-white">Languages</li>
          <li className="ms-auto text-end text-white">
          Bulk Action
          <button className="ms-2">
            <i className="bi bi-chevron-down"></i>
          </button>
          </li>
        </ol>
        <div class="outer-container">
        <div className="table-container">
        <table class="table table-striped">
        <thead>
            <tr className='table-header'>
              < th style={{border: 'none' }}>
                <input type="checkbox" />
              </th>
              <th style={{border: 'none' }}>S.No</th>
              <th style={{border: 'none' }}>Language</th>
              <th style={{border: 'none' }}>Action</th>
            </tr>
          </thead>
            <tbody>
              {language.map((lang, index) => (
                <tr key={lang.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <input type="checkbox" />
                </td>
                  <td>{index + 1}</td>
                  <td className='truncate' title={lang.language}>{lang.language.length> 15 ? `${lang.language.substring(0, 10)}...` : lang.language}  </td>
                  <td>
                    <button onClick={() => handlEdit(lang.id)} className="btn btn-primary me-2">
                      <i className="fas fa-edit" aria-hidden="true"></i> Edit
                    </button>
                    <button onClick={() => handleDeleteLanguage(lang.id)} className="btn btn-danger">
                      <i className="fa fa-trash" aria-hidden="true"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
    
       
      </div>
      </div>
      </div>
      </div>
   
  );
};

export default ViewLanguage;

