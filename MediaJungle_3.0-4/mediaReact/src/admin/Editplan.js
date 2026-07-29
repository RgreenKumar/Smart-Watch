import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../Config';
import "../css/Sidebar.css";

const EditPlan = () => {
  const id = localStorage.getItem('items');
  const [validity, setvalidity] = useState('30');
  const handleAddFeatures = () => navigate('/admin/PlanFeatures');

  const [plan, setPlan] = useState({
    planname: '',
    amount: '',
    validity: ''
  });
  const [features, setFeatures] = useState([]);
  const [featureStates, setFeatureStates] = useState([]);
  const token = sessionStorage.getItem("tokenn");
  console.log(token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanAndFeatures = async () => {
      try {
        // Fetch plan details
        const planResponse = await axios.get(`${API_URL}/api/v2/GetPlanById/${id}`);
        setPlan(planResponse.data);
  
        // Fetch all features
        const featuresResponse = await axios.get(`${API_URL}/api/v2/GetAllFeatures`);
        const allFeatures = featuresResponse.data;
  
        // Fetch existing feature states for the plan
        const featureStatesResponse = await axios.get(`${API_URL}/api/v2/GetFeaturesByPlanId?planId=${id}`);
        const existingFeatureStates = featureStatesResponse.data;
  
        // Map through all features and match with existing feature states to prefill the active/inactive values
        const updatedFeatures = allFeatures.map((feature) => {
          const matchedFeature = existingFeatureStates.find(state => state.featureId === feature.id);
          return {
            ...feature,
            active: matchedFeature ? matchedFeature.active === true ? 'yes' : 'no' : 'no'  // Default to 'no' if not found
          };
        });
  
        setFeatures(updatedFeatures);
        setFeatureStates(existingFeatureStates);
      } catch (error) {
        console.error('Error fetching plan or features:', error);
        throw error;
      }
    };
  
    fetchPlanAndFeatures();
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlan(prevPlan => ({
      ...prevPlan,
      [name]: value,
    }));
  };

  const handleSetActive = (featureId, active) => {
    console.log('Before Update:', features);
  
    const updatedFeatures = features.map((feature) =>
      feature.id === featureId ? { ...feature, active } : feature
    );
    setFeatures(updatedFeatures);
  
    console.log('After Update:', updatedFeatures);
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Step 1: Update the plan data
      await axios.patch(`${API_URL}/api/v2/editPlans/${id}`, plan, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });
  
      // Step 2: Delete existing feature states for the plan
      await axios.delete(`${API_URL}/api/v2/planfeaturemerge?planId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Step 3: Prepare the updated feature states
      const featuresData = features.map(feature => ({
        planId: id,
        featureId: feature.id,
        active: feature.active === 'yes',  // Ensure proper boolean conversion
      }));
  
      // Step 4: Insert the updated feature states
      await axios.put(`${API_URL}/api/v2/planfeaturemerge`, featuresData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
  
      // Success message and redirect
      Swal.fire({ icon: 'success', title: 'Success', text: 'Plan details and features updated successfully' });
      navigate('/admin/PlanDetailsList');
    } catch (error) {
      console.error('Error updating plan details:', error.response ? error.response.data : error.message);
      throw error;
      // Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update plan details. Please try again later.' });
    }
  };
  
  
  

  return (
    <div className="marquee-container">
    <div className='AddArea'>
          {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/AdminPlan")}>Add Plan</button> */}
        </div>  <br/>
    <div className='container3 mt-10'>
      <ol className="breadcrumb mb-4 d-flex my-0">
        <li className="breadcrumb-item"><Link to="/admin/PlanDetailsList">Plans</Link></li>
        <li className="breadcrumb-item active text-white">Edit Plan</li>
      </ol>
      <div className='card-body'>
        <div className='modal-body'>
          <div className='temp'>
            <div className='col-lg-4'>
              <div className='col-lg-12'>
                <label className='custom-label' htmlFor="planname">Plan Name</label>
                <input
                  type="text"
                  name="planname"
                  id="planname"
                  className="form-control"
                  value={plan.planname || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-lg-12">
                <label className='custom-label' htmlFor="amount">Amount (per Month)</label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  className="form-control"
                  value={plan.amount || ''}
                  onChange={handleChange}
                  required
                />
                <br />
              </div>
            </div>

            <div className="col-lg-2 d-flex align-items-center justify-content-center">
              <div style={{ height: "100%", width: "1px", backgroundColor: "skyblue" }}></div>
            </div>

      
            <div className="col-lg-6 w-100 d-flex flex-column align-items-center justify-content-center">
  <div className="w-100 d-flex">
    <div className="w-100" style={{ marginTop: "30px", maxHeight: '300px', overflowY: 'auto', width: '100%' }}>
      {features.length > 0 ? (
        <table className="table" style={{ tableLayout: 'auto', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>S.No</th>
              <th style={{ textAlign: 'center' }}>Feature</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td style={{ textAlign: 'left' }}>{feature.features}</td>
                <td style={{ textAlign: 'center' }}>
                  {feature.active === 'yes' ? <span>&#10003;</span> : <span>&#10007;</span>}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="d-flex justify-content-center">
                    <button
                      className={`btn ${feature.active === 'yes' ? 'btn-success' : 'btn-info'}`}
                      onClick={() => handleSetActive(feature.id, 'yes')}
                      style={{ minWidth: '80px', padding: '5px 10px' }}
                    >
                      Active
                    </button>
                    <button
                      className={`btn ms-2 ${feature.active === 'no' ? 'btn-danger' : 'btn-info'}`}
                      onClick={() => handleSetActive(feature.id, 'no')}
                      style={{ minWidth: '80px', padding: '5px 10px' }}
                    >
                      Inactive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No features available</div>
      )}
    </div>
  </div>
  <div className="position-absolute" style={{ top: '-20px', right: '-10px' }}>
    <button className="btn btn-custom" style={{ fontSize: '15px' }} onClick={handleAddFeatures}>Add Features</button>
  </div>
</div>

            </div>
          </div>
          <div className="d-flex justify-end" style={{ marginTop: "60px", marginRight:"40px" }}>
            <button className='text-center btn btn-custom' onClick={handleSubmit}>UPDATE</button>
          </div>
        </div>
      </div>
    </div>
   
  );
};

export default EditPlan;
