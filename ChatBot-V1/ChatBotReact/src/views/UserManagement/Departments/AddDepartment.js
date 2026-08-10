import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCardHeader,
  CCardBody,
  CButton,
  CFormTextarea,
  CFormInput,
  CFormLabel,
  CCard,
  CCardText,
} from '@coreui/react';
import VITE_API_URL from '../../../Config';

const AddDepartment = ({ department,setDepartment,token, users, onCancel, editDepId}) => {

  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (editDepId) {
      fetchDepartment(editDepId);
    }
  }, [editDepId]);

  const fetchDepartment = async (editDepId) => {
   
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getdep/${editDepId}`);
      const data = response.data;
      setDepartment({
        depName: data.depName,
        description: data.description,
        adminIds: data.admins.map(admin => admin.id),
      });
    } catch (error) {
      console.error('Error fetching department:', error);
      alert('Failed to load department for editing.');
    } 
  };
  console.log(department)

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setDepartment((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckboxChange = (userId) => {
    setDepartment((prev) => {
      const updatedAdmins = prev.adminIds.includes(userId)
        ? prev.adminIds.filter((id) => id !== userId)
        : [...prev.adminIds, userId];
      return { ...prev, adminIds: updatedAdmins };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editDepId
        ? `${VITE_API_URL}/chatbot/updatedepartment/${editDepId}`
        : `${VITE_API_URL}/chatbot/adddepartment`;
  
      const method = editDepId ? 'patch' : 'post';
  
      const response = await axios({
        method,
        url,
        data: {
          depName: department.depName,
          description: department.description,
          adminIds: department.adminIds,
        },
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        alert(editDepId ? 'Department updated successfully!' : 'Department added successfully!');
  
        // Reset form only if adding a new department
        if (!editDepId) {
          setDepartment({
            depName: '',
            description: '',
            adminIds: [],
          });
        }
      } else {
        alert('Unexpected response from server.');
      }
    } catch (error) {
      console.error('Error saving department:', error.response?.data || error.message);
      alert(error.response?.data || 'Something went wrong.');
    }
  };
  
  
  

  return (
    <>
      <CCardHeader>Add Department</CCardHeader>

      <CCardBody className="p-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px', padding: '10px' }}>
          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <CFormLabel className="mb-2 w-50" htmlFor="depName">Name</CFormLabel>
            <CFormInput
              type="text"
              id="depName"
              placeholder="Enter department name"
              className="w-50"
              value={department.depName || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <CFormLabel className="mb-2 w-50" htmlFor="description">Description</CFormLabel>
            <CFormTextarea
              id="description"
              rows={4}
              placeholder="Enter description"
              className="w-50"
              value={department.description || ""}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CFormLabel className="mb-2 w-50" htmlFor="members">Members</CFormLabel>
            <CCard style={{ width: '18rem' ,borderRadius:'3px',maxHeight:'150px',overflowY:'auto'}}>
            {users.map((user) => {
              const isAssigned = user.department !== null;
              return (
                <CCardText
                  className="p-1 mb-0"
                  key={user.id}
                  style={{ display: 'flex', alignItems: 'center', color: isAssigned ? '#999' : '#000' }}
                >
                  <input
                    type="checkbox"
                    id={`member-${user.id}`}
                    checked={department.adminIds.includes(user.id)}
                    disabled={!editDepId && isAssigned}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                  <label htmlFor={`member-${user.id}`} style={{ marginLeft: '10px' }}>
                    {user.username}
                  </label>
                </CCardText>
              );
            })}
            </CCard>
          </div>
        </div>

        <hr />

        {/* Footer buttons inside the card */}
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <CButton
            className="me-md-2"
            style={{ backgroundColor: '#F3F4F7', border: '1px solid #79747E' }}
            onClick={onCancel}
          >
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: '#5856D6', color: '#FFFFFF' }}
            onClick={handleSubmit}
          >
            Save
          </CButton>
        </div>
      </CCardBody>
    </>
  );
};

export default AddDepartment;
