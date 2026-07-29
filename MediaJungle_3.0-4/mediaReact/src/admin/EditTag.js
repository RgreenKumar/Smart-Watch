import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useLocation , Link} from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const EditTag = () => {

  const id=localStorage.getItem('items');
  const [UpdatedTag, setUpdatedTag] = useState({tag:''});
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem('tokenn')

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTag((prevTag) => ({
      ...prevTag,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetTagById/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUpdatedTag(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching tag:', error);
        throw error;
      });
  }, [id]);

 
  


const handleSubmit = (e) => {
  e.preventDefault();
  const tagId = id;

  fetch(`${API_URL}/api/v2/editTag/${tagId}`, {
    method: 'PATCH',
    headers: {
       Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(UpdatedTag),
  })
  .then((response) => {
    if (response.ok) {
      console.log('Tag updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tag details successfully updated',
      });
    // } else {
    //   console.log('Error updating Tag');
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error',
    //     text: 'Error updating tag',
    //   });
    }
  })
  .catch((error) => {
    console.log('Error updating tag:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: 'An error occurred while updating the tag',
    // });
  });
};

  // ...
  
  
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
                      <th>Tag</th>
                      <td>
                        <input
                          type="text"
                          name="tag"
                          value={UpdatedTag.tag}
                          onChange={handleChange}
                          className="form-control"
                        />
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

export default EditTag;