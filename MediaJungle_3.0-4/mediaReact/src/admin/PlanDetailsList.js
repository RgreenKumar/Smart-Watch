import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API_URL from '../Config';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";

const PlanDetailsList = () => {

    const [getall,setgetall] = useState('');
    const navigate = useNavigate();
    const token = sessionStorage.getItem('tokenn')

    const handleClick = (link) => {
      navigate(link);
    }

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllPlans`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setgetall(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);



  const handleDelete = (planId) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this plan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            const apiUrl1 = `${API_URL}/api/v2/planfeaturemerge?planId=${planId}`;
            const apiUrl2 = `${API_URL}/api/v2/plans/${planId}`;

            Promise.all([
                fetch(apiUrl1, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(apiUrl2, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
            ])
            .then(async ([response1, response2]) => {
                console.log('Response 1 Status:', response1.status);
                console.log('Response 2 Status:', response2.status);

                const [text1, text2] = await Promise.all([response1.text(), response2.text()]);
                console.log('Response 1 Body:', text1);
                console.log('Response 2 Body:', text2);

                // Check if both responses indicate success
                if (response1.ok && response2.ok) {
                    // Remove the deleted plan from the state
                    setgetall(prevPlans => prevPlans.filter(plan => plan.id !== planId));
                    Swal.fire('Deleted!', 'Your plan and associated features have been deleted.', 'success').then(() => {
                        navigate('/admin/PlanDetailsList'); // Redirect to plan list page
                    });
                } else {
                    throw new Error('Failed to delete one or both resources');
                }
            })
            .catch(error => {
                console.error('Error deleting plan:', error);
                Swal.fire('Error!', 'Failed to delete plan. Please try again later.', 'error');
                throw error;
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Delete operation cancelled');
        }
    });
};


  const handlEdit = async (planId) => {
    localStorage.setItem('items', planId);
    navigate('/admin/Editplan');
  };

  const handlAddDescription = async (planId) => {
            localStorage.setItem('items', planId);
            navigate('/admin/PlanDescription');
  };



  return (
    
    <div className="marquee-container">
    <div className='AddArea'>
          <button className='btn btn-custom' onClick={() => handleClick("/admin/AdminPlan")}>Add Plan</button>
        </div>  <br/>
     <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex  my-0">
        <li className="breadcrumb-item text-white"><Link to="/admin/PlanDetailsList">Plans</Link>
        </li>
        <li className="ms-auto text-end text-white">
          Bulk Action
          <button className="ms-2">
            <i className="bi bi-chevron-down"></i>
          </button>
        </li>
          {/* <li className="breadcrumb-item active">List Plans</li> */}
        </ol>
        {/* <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            
              <div className="card-1 mb-4" style={{ height: "auto" }}>
                <div className="card-header">
                  <i className="fas fa-table me-1"></i>
                  Plan List
                </div> */}
                <div className="table-container">
                <table class="table table-striped">
                    <thead>
                      <tr className='table-header'>
                      < th style={{border: 'none' }}>
                <input type="checkbox" />
              </th>
                        <th style={{border: 'none' }}>S.No</th>
                        <th style={{border: 'none' }}>Plan name</th>
                        <th style={{border: 'none' }}>Amount</th>
                        {/* <th>Validity</th> */}
                        <th style={{border: 'none' }}>Action</th>
                        {/* <th>Features</th> */}
                      </tr>
                    </thead>
                    <tbody>
                    {getall && getall.length > 0 && (
                      getall.map((plan, index) => (
                        <tr key={plan.id}>
                               <td>
                  <input type="checkbox" />
                </td>
                          <td className='truncate' title={index}>{index + 1}</td>
                          <td className='truncate' title={plan.planname}>{plan.planname.length> 15 ? `${plan.planname.substring(0, 10)}...` : plan.planname}</td>
                          <td className='truncate' title={plan.amount}>{plan.amount.length> 15 ? `${plan.amount.substring(0, 10)}...` : plan.amount}</td>
                          {/* <td>{plan.validity}</td> */}
                          <td> <button  className="btn btn-primary me-2" onClick={() => handlEdit(plan.id)}>
                              <i className="fas fa-edit" aria-hidden="true"></i>Edit
                            </button>
              
                            <button   className="btn btn-danger" onClick={() => handleDelete(plan.id)}>
                              <i className="fa fa-trash" aria-hidden="true"></i>Delete
                            </button></td>
                          {/* <td>
                            <button  onClick={() => handleClick("/admin/PlanFeatures")} className="btn btn-secondary ml-2" >
                                View
                            </button>
                          </td> */}
                          </tr>
                      )))}
                    </tbody>
                </table>
     </div>

    </div>
    </div>   
    // </div>
    // </div>

  )
}

export default PlanDetailsList