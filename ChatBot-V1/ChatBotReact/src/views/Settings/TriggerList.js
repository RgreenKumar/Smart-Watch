import React, { useState,useEffect } from "react";
import axios from "axios";
import {
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSwitch,
} from '@coreui/react'
import { FaSearch, FaPlus } from 'react-icons/fa'
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import the icons
import VITE_API_URL from "../../Config";


const TriggerList = ({token,GetTrigger,onAddTriggerClick,refreshTrigger,Edit}) => {

  const [selectedTrigger, setSelectedTrigger] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status,setStatus] = useState('');

  console.log("trigger",GetTrigger)

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTrigger([]);
    } else {
      const allIds = GetTrigger.map((trigger) => trigger.id);
      setSelectedTrigger(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowCheckboxChange = (id) => {
    if (selectedTrigger.includes(id)) {
      setSelectedTrigger(selectedTrigger.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedTrigger([...selectedTrigger, id]);
    }
  };

  const handleStatusChange = async (triggerId, newStatus) => {
  try {
    const formData = new FormData();
    formData.append("triggerId", triggerId);
    formData.append("status", newStatus);

    const response = await axios.post(
      `${VITE_API_URL}/chatbot/UpdateTriggerStatus`,
      formData,
      {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      console.log("Status updated successfully");
      refreshTrigger(); // refresh list to reflect updated status
    } else {
      console.log(response.data || "Update failed!");
    }
  } catch (error) {
    console.log(error.response?.data || "Error updating status!");
  }
};


  const handleDelete = async (triggerId) => {
    try{
      const response = await axios.delete(`${VITE_API_URL}/chatbot/deleteTrigger/${triggerId}`,{
        headers:{
          Authorization: token,
        }
      });
      if (response.status <= 204) {
        refreshTrigger();
        alert('Trigger deleted successfully');
      } else {
        console.log(response.data);
      }
    } catch (error) {
      if (error.response) {
        console.error(error.response.data.message);
        alert(error.response.data.message);
      } else {
        console.error('Something went wrong', error.message);
      }
    }
  };

  return (
    
    <>
      <CCardHeader>
        <CRow className="align-items-center">
          <CCol xs="12" sm="10" className="mb-2 mb-sm-0">
            <h6 className="fw-bold mb-0">Triggers</h6>
          </CCol>
          <CCol xs="12" sm="2" className="text-sm-end">
            <CButton  
              style={{backgroundColor:'#74B047',color:'white',fontSize:'12px'}}
              onClick={onAddTriggerClick}>
              <FaPlus className="me-2" />
              Add Trigger
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody style={{ maxHeight: '520px', overflowY: 'auto' }}>
        <CTable>
          <CTableHead >
             <CTableRow>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width: '20%' }}>Name</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width:'40%'}}>Description</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7'}}>Status</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7'}}>Type</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7',width:'10%'}}>Action</CTableHeaderCell>
             </CTableRow>
          </CTableHead>
          <CTableBody>
            {GetTrigger && GetTrigger.length > 0 ? (
                GetTrigger.map((trigger) => (
                  <CTableRow key={trigger.triggerid}>
                    <CTableHeaderCell scope="row">
                      <input
                        type="checkbox"
                        checked={selectedTrigger.includes(trigger.triggerid)}
                        onClick={() => handleRowCheckboxChange(trigger.triggerid)}
                      />
                    </CTableHeaderCell>
            
                    <CTableDataCell>{trigger.name}</CTableDataCell>
                    <CTableDataCell>{trigger.textOption?.text || ''}</CTableDataCell>
                   <CTableDataCell>
  <CFormSwitch 
    id={`status-${trigger.triggerid}`}
    checked={trigger.status}
    onChange={() => handleStatusChange(trigger.triggerid, !trigger.status)}
  />
</CTableDataCell>

                    <CTableDataCell>{trigger.triggerType.triggerType}</CTableDataCell>
            
                    <CTableDataCell>
                      <FaEdit
                        className="me-2 p-2"
                        style={{
                          backgroundColor: '#93BF42',
                          color: 'white',
                          fontSize: '30px',
                          borderRadius: '2px',
                        }}
                        onClick={() => Edit(trigger.triggerid)}
                      />
                      <FaTrash
                        className="me-1 p-2"
                        style={{
                          backgroundColor: '#F42A2A',
                          color: 'white',
                          fontSize: '30px',
                          borderRadius: '2px',
                        }}
                        onClick={() => handleDelete(trigger.triggerid)}
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center">
                    No Trigger available.
                  </CTableDataCell>
                </CTableRow>
              )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </>
  )
}

export default TriggerList