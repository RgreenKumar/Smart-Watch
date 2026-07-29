import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const ViewTag = () => {
     const navigate = useNavigate();
  const [Tag, setTag] = useState([]);
  const token = sessionStorage.getItem('tokenn')
  const handleClick = (link) => {
    localStorage.removeItem('items'); // Clear the stored videoId
    navigate(link);
  }
  useEffect(() => {
    // fetch category data from the backend
    fetch(`${API_URL}/api/v2/GetAllTag`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTag(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);

const handleDeleteTag = (tagId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/api/v2/DeleteTag/${tagId}`, {
        method: 'DELETE',
        headers:{
          Authorization: token,
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // If the response status is OK, don't attempt to parse JSON from an empty response
        return response.status <= 204 ? null : response.json();
      })
      .then(data => {
        if (data) {
          console.log('Tag deleted successfully', data);
        } else {
          console.log('Tag deleted successfully (no content)');
        }
        // Remove the deleted tag from the local state
        setTag(prevTag => prevTag.filter(tag => tag.id !== tagId));
        Swal.fire(
          'Deleted!',
          'Your tag has been deleted.',
          'success'
        );
      })
      .catch(error => {
        console.error('Error deleting tag:', error);
        throw error;
        // Swal.fire(
        //   'Error!',
        //   'There was a problem deleting your tag. Please try again later.',
        //   'error'
        // );
      });
    }
  });
};


  const handlEdit = async (tagId) => {
    localStorage.setItem('items', tagId);
    navigate('/admin/AddTag');
  };



  return (
      
    <div className="marquee-container">
      <div className='AddArea'>
        <button className='btn btn-custom' onClick={() => handleClick("/admin/AddTag")}>Add Tag</button>
      </div><br/>
      <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex  my-0"> 
          <li className="breadcrumb-item text-white">Tags</li>
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
              <th style={{border: 'none' }}>Tags Name</th>
              <th style={{border: 'none' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Tag.map((tag, index) => (
              <tr key={tag.tag_id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{index + 1}</td>
                <td className='truncate' title={tag.tag}>{tag.tag.length> 15 ? `${tag.tag.substring(0, 10)}...` : tag.tag} </td>
                <td>
                  <button onClick={() => handlEdit(tag.tag_id)} className="btn btn-primary me-2">
                    <i className="fas fa-edit" aria-hidden="true"></i> Edit
                  </button>
                  <button onClick={() => handleDeleteTag(tag.tag_id)}className="btn btn-danger">
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

export default ViewTag;

