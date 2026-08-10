import React, { useState } from 'react';
import { CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CRow, CCol, CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import VITE_API_URL from '../../../Config';

const MemberList = ({ admins, token, onAddMemberClick, refreshAdmins,Edit }) => {
    const [selectedAdmins, setSelectedAdmins] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
  
    const handleSelectAll = () => {
          if (selectAll) {
            setSelectedAdmins([]);
          } else {
            const allIds = admins.map((admin) => admin.id);
            setSelectedAdmins(allIds);
          }
          setSelectAll(!selectAll);
        };
        
        const handleRowCheckboxChange = (id) => {
          if (selectedAdmins.includes(id)) {
            setSelectedAdmins(selectedAdmins.filter((selectedId) => selectedId !== id));
          } else {
            setSelectedAdmins([...selectedAdmins, id]);
          }
        };
        
          console.log(selectedAdmins)
            
              const handleDelete = async (adminId) => {
                try{
                  const response = await axios.delete(`${VITE_API_URL}/chatbot/delete/${adminId}`,{
                    headers:{
                      Authorization: token,
                    }
                  });
                  if (response.status <= 204) {
                    refreshAdmins();
                    alert('Admin deleted successfully');
                    window.location.reload(); // Reload the entire window
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
             <h6 className="fw-bold mb-0">Property Members</h6>
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
             <CButton  style={{backgroundColor:'#74B047',color:'white'}}
            onClick={onAddMemberClick}>
              <FaPlus className="me-2" />
              Add Member
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

    <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width: '40%' }}>Agent</CTableHeaderCell>
    <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>Role</CTableHeaderCell>
    <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>Agent Status</CTableHeaderCell>
    <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>Action</CTableHeaderCell>
  </CTableRow>
</CTableHead>

                <CTableBody>
                {admins && admins.length > 0 ? (
                  admins.map((admin) => (
                    <CTableRow key={admin.id}>
                      <CTableHeaderCell scope="row">
  <input
    type="checkbox"
    checked={selectedAdmins.includes(admin.id)}
    onChange={() => handleRowCheckboxChange(admin.id)}
  />
</CTableHeaderCell>

                      <CTableDataCell>{admin.username == null ? admin.email : admin.username}</CTableDataCell>
                      <CTableDataCell>{admin.role?.role || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        {admin.status === true ? (
                          <span style={{ backgroundColor: '#F9B115', padding: '4px 8px', borderRadius: '4px', color: 'white' ,display:'inline-block',width:'100px',textAlign:'center'}}>
                            Active 
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#E55353', padding: '4px 8px', borderRadius: '4px', color: 'white',display:'inline-block',width:'100px',textAlign:'center' }}>
                            Pending
                          </span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell>
                          <FaEdit
                            className="me-2 p-2"
                            style={{
                              backgroundColor: '#93BF42',
                              color: 'white',
                              fontSize: '30px', // Adjust the font size here
                              borderRadius:'2px',
                            }}
                            onClick={()=>Edit(admin.id)}
                          />
                          <FaTrash 
                            className="me-1 p-2"
                            style={{
                              backgroundColor:'#F42A2A',
                              color:'white',
                              fontSize:'30px',
                              borderRadius:'2px',
                            }}
                            onClick={() =>handleDelete(admin.id)}
                          /> {/* Trash icon for Delete */}
                      </CTableDataCell>

                    </CTableRow>
                    ))
                  ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center">
                          No Admins available.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                    </CTableBody>

              </CTable>
      </CCardBody>
      </>
    )
}

export default MemberList