import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';

const PlanDescription = () => {
  const id = localStorage.getItem('items');
  const planid = id;
  const token = sessionStorage.getItem('tokenn');

  const [description, setDescription] = useState('');
  const [getall, setGetAll] = useState(null); // Use null to indicate initial loading state

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/GetPlanById/${planid}`);
      setGetAll(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const planDescription = {
        description: description,
      };

      for (const key in planDescription) {
        formData.append(key, planDescription[key]);
      }

      const response = await axios.post(`${API_URL}/api/v2/AddPlanDescription`, formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });

      setDescription(''); // Clear input after successful submission
      fetchData(); // Refresh data after adding description

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Feature added successfully',
      });
    } catch (error) {
      console.error('Error uploading plan description:', error.response || error.message);
      throw error;
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: error.response ? error.response.data.message : 'Failed to add feature. Please try again later.',
      // });
    }
  };

  const handleSetActive = async (descId, active) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v2/active/${descId}?active=${active}`,
        null,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Update the active status in the state
      const updatedDescriptions = getall.descriptions.map((desc) => {
        if (desc.id === descId) {
          return { ...desc, active: active };
        }
        return desc;
      });

      setGetAll({ ...getall, descriptions: updatedDescriptions });
    } catch (error) {
      console.error(`Error setting plan description ${descId} active=${active}:`, error);
      throw error;
    }
  };

  const handleDeleteDescription = async (descId) => {
    try {
      await axios.delete(`${API_URL}/api/v2/deletedesc/${descId}`, {
        headers: {
          Authorization: token,
        },
      });

      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error(`Error deleting plan description ${descId}:`, error);
      throw error;
    }
  };

  return (
    <div className='container2 mt-20'>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/admin/PlanDetailsList">Plans</Link>
        </li>
        <li className="breadcrumb-item active  text-white">
          {getall ? `${getall.planname}'s Description` : 'Loading...'}
        </li>
      </ol>
      <div className="row">
        {/* Left side with the form */}
        <div className="col-lg-12">
          <div className="card-body">
            <form className="form-container" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="temp">
                  <div className="col-lg-12">
                    <label htmlFor="planname">Add Plan Features</label>
                    <input
                      type="text"
                      name="planname"
                      id="planname"
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex justify-content-center">
                      <button type="submit" className="btn btn-info">
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right side with descriptions */}
        <div className="col-lg-12">
          {getall && getall.descriptions && getall.descriptions.length > 0 ? (
            getall.descriptions.map((desc, index) => (
              <div key={index} className="w-100 mb-2 d-flex align-items-center">
                <button style={{ width: "500px" }}>
                  {index + 1}. {desc.description}
                  {desc.active === 'yes' && <span>&#10003;</span>} {/* Checkmark if active */}
                  {desc.active === 'no' && <span>&#10007;</span>} {/* Wrong mark if inactive */}
                </button>
                <button
                  className="btn btn-info"
                  style={{ margin: "3px 0 0 0" }}
                  onClick={() => handleSetActive(desc.id, 'yes')}
                >
                  Active
                </button>
                <button
                  className="btn btn-info"
                  style={{ margin: "3px 0 0 3px" }}
                  onClick={() => handleSetActive(desc.id, 'no')}
                >
                  Inactive
                </button>
                <button style={{ margin: "3px 0 0 3px" }} onClick={() => handleDeleteDescription(desc.id)}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            ))
          ) : (
            <div>No descriptions available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDescription;
