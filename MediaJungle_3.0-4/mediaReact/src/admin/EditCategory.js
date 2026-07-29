import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../Config';

const EditCategory = () => {
  const id = localStorage.getItem('items');
  const [updatedcategory, setUpdatedcategory] = useState({ categories: '' });
  const token = sessionStorage.getItem('tokenn')

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetCategoryById/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUpdatedcategory(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching category:', error);
        throw error;
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedcategory(prevCategory => ({
      ...prevCategory,
      [name]: value,
    }));
  };



const handleSubmit = (e) => {
  e.preventDefault();
  const categoryId = id;

  fetch(`${API_URL}/api/v2/editCategory/${categoryId}`, {
    method: 'PATCH',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedcategory),
  })
  .then((response) => {
    if (response.ok) {
      console.log('Category updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Category details successfully updated',
      });
    } else {
      console.log('Error updating category');
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Error updating category',
      // });
    }
  })
  .catch((error) => {
    console.log('Error updating category:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: 'An error occurred while updating the category',
    // });
  });
};


  if (!updatedcategory) {
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
                        <th>Category</th>
                        <td>
                          <input
                            type="text"
                            name="categories"
                            value={updatedcategory.categories}
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

export default EditCategory;