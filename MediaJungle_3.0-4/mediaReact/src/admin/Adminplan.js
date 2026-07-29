  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { Link, useNavigate } from 'react-router-dom';
  import Swal from 'sweetalert2';
  import API_URL from '../Config';
  import "../css/Sidebar.css";

  const Adminplan = () => {
    const [planname, setplanname] = useState('');
    const [amount, setamount] = useState('');
    const [validity, setvalidity] = useState('30');
    const [getall, setgetall] = useState();
    const [features, setfeatures] = useState([]);
    const navigate = useNavigate();
    const token = sessionStorage.getItem("tokenn");
    const [featureStates, setFeatureStates] = useState([]);

    useEffect(() => {
      const fetchFeatures = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/v2/GetAllFeatures`);
          const updatedFeatures = response.data.map((feature) => ({
            ...feature,
            active: feature.active === undefined || feature.active === null ? null : feature.active,
          }));
          setfeatures(updatedFeatures);
        } catch (error) {
          console.error('Error fetching features:', error);
          throw error;
        }
      };
      fetchFeatures();
    }, []);

    useEffect(() => {
      fetch(`${API_URL}/api/v2/getrazorpay`)
        .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
        .then(data => setgetall(data))
        .catch(error => {console.error('Error fetching data:', error); throw error;});
    }, []);

    const hasPaymentPlan = () => getall && getall.length > 0;

    const handleSetActive = (featureId, active) => {
      // Update local state for the specific feature
      const updatedFeatureStates = featureStates.map((feature) =>
        feature.id === featureId ? { ...feature, active } : feature
      );
      setFeatureStates(updatedFeatureStates);
    
      // Update the features state if needed
      const updatedFeatures = features.map((feature) =>
        feature.id === featureId ? { ...feature, active } : feature
      );
      setfeatures(updatedFeatures);
    };
    

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!hasPaymentPlan()) {
        Swal.fire({
          title: 'Error!',
          text: 'You first need to add a key and secret key to enable this option.',
          icon: 'error',
          confirmButtonText: 'Go to Payment setting page',
          showCancelButton: true,
        }).then(result => {
          if (result.isConfirmed) {
            navigate('/admin/Payment_setting');
          }
        });
        return;
      }
    
      try {
        // Prepare plan data
        const formData = new FormData();
        const planData = { planname, amount, validity };
        Object.keys(planData).forEach(key => formData.append(key, planData[key]));
    
        // Send request to save plan details
        const planResponse = await axios.post(`${API_URL}/api/v2/PlanDetails`, formData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        });
    
        // Extract planId from response
        const planId = planResponse.data.id;
        console.log("Plan ID:", planId);
    
        // Collect feature data
        const featuresData = features.map(feature => ({
          planId,
          featureId: feature.id,
          active: feature.active === 'yes', // Adjust if needed based on your data
        }));
        console.log("Features Data:", featuresData);
    
        // Send request to save features
        await axios.put(`${API_URL}/api/v2/planfeaturemerge`, featuresData, {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });
    
        Swal.fire({ icon: 'success', title: 'Success', text: 'Plan details and features updated successfully' });
    
        // Clear form fields and feature states
        setplanname(''); 
        setamount(''); 
        setvalidity('30');
            // Redirect to PlanDetailsList page after successful save
    navigate('/admin/PlanDetailsList');
        // setfeatures([]); // Clear the features array
      } catch (error) {
        console.error('Error uploading plan details:', error.response ? error.response.data : error.message);
        // Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to upload plan details. Please try again later.' });
        throw error;
      }
    };
    
    

    const handleAddFeatures = () => navigate('/admin/PlanFeatures');

    return (
      <div className="marquee-container">
      <div className='AddArea'>
        {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button> */}
      </div><br/>
      <div className='container3 mt-10'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item"><Link to="/admin/PlanDetailsList">Plans</Link></li>
          <li className="breadcrumb-item active text-white">Add Plan</li>
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
                    value={planname}
                    onChange={(e) => setplanname(e.target.value)}
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
                    value={amount}
                    onChange={(e) => setamount(e.target.value)}
                    required
                  />
                  <br />
                </div>
                <div className='col-lg-12'>
                  <input
                    type="hidden"
                    name="validity"
                    id="validity"
                    className="form-control"
                    value={validity}
                    onChange={(e) => setvalidity(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-2 d-flex align-items-center justify-content-center">
                <div style={{ height: "100%", width: "1px", backgroundColor: "skyblue" }}></div>
              </div>

              <div className="col-lg-6 position-relative">
                <div className="w-100 d-flex flex-column align-items-center justify-content-center">
                  <div className="w-100 d-flex">
                  <div className="w-100" style={{ marginTop:"30px", maxHeight: '300px', overflowY: 'auto', width:'100%' }}>
    <table className="table"  style={{ tableLayout: 'auto', width: '100%' }}>
      <thead>
        <tr>
          <th style={{textAlign:'center'}}>S.No</th>
          <th style={{textAlign:'center'}}>Feature</th>
          <th style={{textAlign:'center'}}>Status</th>
          <th style={{textAlign:'center'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {features.map((feature, index) => (
          <tr key={index}>
            <td style={{textAlign:'center'}}>{index+1}</td>
            <td style={{ textAlign: "left" }}>
              {feature.features}
            </td>
            <td style={{ textAlign: "center" }}>
              {feature.active === 'yes' ? (
                <span>&#10003;</span>
              ) : (
                <span>&#10007;</span>
              )}
            </td>
            <td style={{ textAlign: "center" }}>
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

</div>

                  </div>
                </div>
                <div className="position-absolute" style={{ top: '-20px', right: '-10px' }}>
                  <button className="btn btn-custom" style={{ fontSize: '15px' }} onClick={handleAddFeatures}>Add Features</button>
                </div>
              </div>
            </div >
            <div className="d-flex justify-content-center" style={{ marginTop: "10px" }}>
              <button className='ml-auto mr-10 mt-16 text-center btn btn-custom' onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };

  export default Adminplan;
