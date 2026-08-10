import React, { useState,useEffect } from "react";
import axios from "axios";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { FaSearch, FaPlus } from 'react-icons/fa'
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import the icons
import VITE_API_URL from "../../../Config";

const DepartmentList = ({refreshDepartment,departments,token,onAddDepClick,Edit}) => {

  const [selectedDep, setSelectedDep] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
    
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDep([]);
    } else {
      const allIds = departments.map((dep) => dep.id);
      setSelectedDep(allIds);
    }
    setSelectAll(!selectAll);
  };
  
  const handleRowCheckboxChange = (id) => {
    if (selectedDep.includes(id)) {
      setSelectedDep(selectedDep.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedDep([...selectedDep, id]);
    }
  };
  
  const handleDelete = async (depId) => {
    try{
      const response = await axios.delete(`${VITE_API_URL}/chatbot/deleteDep/${depId}`,{
        headers:{
          Authorization: token,
        }
      });
      if (response.status <= 204) {
        refreshDepartment();
        alert('Department deleted successfully');
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
              {/* Title */}
              <CCol xs="12" sm="6" className="mb-2 mb-sm-0">
                <h6 className="fw-bold mb-0">Departments</h6>
              </CCol>
    
              {/* Search Input */}
              <CCol xs="12" sm="4" className="mb-2 mb-sm-0">
                <CInputGroup className='p-0'>
                  <CInputGroupText>
                    <FaSearch />
                  </CInputGroupText>
                  <CFormInput placeholder="Search members..." />
                </CInputGroup>
              </CCol>
    
              {/* Add Member Button */}
              <CCol xs="12" sm="2" className="text-sm-end">
                <CButton  style={{backgroundColor:'#74B047',color:'white',fontSize:'12px'}}
                 onClick={onAddDepClick}>
                  <FaPlus className="me-2" />
                  Add Departments
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
          
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width: '40%' }}>Department</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>Description</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7',textAlign:'center' }}>Members</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead> 
          <CTableBody>
  {departments && departments.length > 0 ? (
    departments.map((dep) => (
      <CTableRow key={dep.id}>
        <CTableHeaderCell scope="row">
          <input
            type="checkbox"
            checked={selectedDep.includes(dep.id)}
            onChange={() => handleRowCheckboxChange(dep.id)}
          />
        </CTableHeaderCell>

        <CTableDataCell>{dep.depName}</CTableDataCell>
        <CTableDataCell>{dep.description}</CTableDataCell>
        <CTableDataCell style={{ textAlign: 'center' }}>{dep.memberCount}</CTableDataCell>

        <CTableDataCell>
          <FaEdit
            className="me-2 p-2"
            style={{
              backgroundColor: '#93BF42',
              color: 'white',
              fontSize: '30px',
              borderRadius: '2px',
            }}
            onClick={() => Edit(dep.id)}
          />
          <FaTrash
            className="me-1 p-2"
            style={{
              backgroundColor: '#F42A2A',
              color: 'white',
              fontSize: '30px',
              borderRadius: '2px',
            }}
            onClick={() => handleDelete(dep.id)}
          />
        </CTableDataCell>
      </CTableRow>
    ))
  ) : (
    <CTableRow>
      <CTableDataCell colSpan="5" className="text-center">
        No departments available.
      </CTableDataCell>
    </CTableRow>
  )}
</CTableBody>
          
                        </CTable>
                </CCardBody>
          </>
  )
}

export default DepartmentList