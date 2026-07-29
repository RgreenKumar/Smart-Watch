import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';

const Viewcastandcrew = () => {
  const [getall, setGetall] = useState([]);
  const [image,setimage] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('tokenn')
  const handleClick = (link) => {
    localStorage.removeItem('items');
    navigate(link);
  }

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllcastandcrew`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGetall(data);
        console.log("image",image)
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);

  const handleDelete = (castId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/api/v2/Deletecastandcrew/${castId}`, {
          method: 'DELETE',
          headers:{
            Authorization:token
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.status <= 205 ? {} : response.json();
          })
          .then(data => {
            if (data) {
              console.log('Cast and crew deleted successfully', data);
            } else {
              console.log('Cast and crew deleted successfully (no content)');
            }

            setGetall(prevCast => prevCast.filter(cast => cast.id !== castId));

            Swal.fire({
              title: 'Deleted!',
              text: 'Cast and crew have been deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          })
          .catch(error => {
            console.error('Error deleting cast and crew:', error);

            // Swal.fire({
            //   title: 'Error!',
            //   text: 'There was an error deleting the cast and crew.',
            //   icon: 'error',
            //   confirmButtonText: 'OK',
            // });
            throw error;
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Swal.fire({
        //   title: 'Cancelled',
        //   text: 'Your cast and crew are safe :)',
        //   icon: 'error',
        //   confirmButtonText: 'OK',
        // });
      }
    });
  };

  const handlEdit = async (castId) => {
    localStorage.setItem('items', castId);
    navigate('/admin/Addcastcrew');
  };

  return (
    <div className="marquee-container">
        <div className='AddArea'>
          <button className='btn btn-custom' onClick={() => handleClick("/admin/AddCastCrew")}>Add Cast and Crew</button>
        </div><br/>
      <div className='container3'>
      <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item text-white">
          Cast and Crews
          </li>
          <li className="ms-auto text-end text-white">
        Bulk Action
        <button className="ms-2">
          <i className="bi bi-chevron-down"></i>
        </button>
      </li>
        </ol>
       
        <div class="outer-container">
    <div className="table-container">
      <table className="table table-striped ">
        <thead>
          <tr className='table-header'>
            <th style={{border: 'none' }}>
              <input type="checkbox" />
            </th>
                    <th style={{border: 'none' }}>S.No</th>
                    <th style={{border: 'none' }}>Name</th>
                    <th style={{border: 'none' }}>Image</th>
                    <th style={{border: 'none' }}>Description</th>
                    <th style={{border: 'none' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getall && getall.length > 0 && (
                    getall.map((cast, index) => (
                      <tr key={cast.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td className='truncate'>
                <input type="checkbox" />
              </td>
                        <td className='truncate' title={index}>{index + 1}</td>
                        <td className='truncate' title={cast.name}>{cast.name.length> 15 ? `${cast.name.substring(0, 10)}...` : cast.name}  </td>
                        <td className='truncate'>
                          {cast.image && (
                            
                            <img src={`data:image/jpeg;base64,${cast.image}`} alt={cast.name} style={{ width: '55px', height: 'auto' }} />
                          )}
                        </td>
                        <td className='truncate' title={cast.description}>{cast.description.length> 15 ? `${cast.description.substring(0, 10)}...` : cast.description}</td>
                        <td>
                          <button onClick={() => handlEdit(cast.id)}className="btn btn-primary me-2">
                  <i className="fas fa-edit" aria-hidden="true"></i> Edit
                </button>

                          <button onClick={() => handleDelete(cast.id)}className="btn btn-danger">
                  <i className="fa fa-trash" aria-hidden="true"></i> Delete
                </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
   
  )
}

export default Viewcastandcrew;
