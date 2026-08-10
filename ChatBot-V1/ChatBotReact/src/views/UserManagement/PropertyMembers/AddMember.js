import React, { useState,useEffect } from 'react';
import { CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CRow, CCol, CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import {FaPlus,FaTrash } from 'react-icons/fa';
import axios from 'axios';
import VITE_API_URL from '../../../Config';


const AddMember = ({rows, setRows, token,onCancel,editUserId}) => {

  console.log("editID",editUserId)

  const [editRow, setEditRow] = useState(null);

  console.log(token)


  useEffect(() => {
    if (editUserId) {
      fetchAdmin(editUserId);
    }
  }, [editUserId]);
  
  const fetchAdmin = async (editUserId) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getAdminbyid/${editUserId}`);
      const data = response.data;
      setEditRow({
        email: data.email,
        role: data.role.role,
        status:data.status,
      });
    } catch (error) {
      console.error('Error fetching admin:', error);
      alert('Failed to load admin for editing.');
    }
  };
  
  console.log("editrow",editRow)

  const handleUpdateAdmin = async () => {
    if (!editRow.email || !editRow.role) {
      alert("Email and role are required.");
      return;
    }
  
    try {
      const response = await fetch(`${VITE_API_URL}/chatbot/updateAdmin/${editUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: token,
        },
        body: new URLSearchParams({
          email: editRow.email,
          role: editRow.role,
        }),
      });
  
      const result = await response.text();
  
      if (!response.ok) {
        alert(`Failed to update: ${result}`);
      } else {
        alert("Admin updated successfully!");
        onCancel(); // You can use this to close the edit form
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Error while updating admin.");
    }
  };
  

    const handleAddRow = () => {
      setRows([...rows, { email: '', role: '' }])
    }
        
    const handleDeleteRow = (index) => {
        const updated = [...rows]
        updated.splice(index, 1)
        setRows(updated)
    }

    

    const handleSendInvitations = async () => {
      for (const row of rows) {
        if (!row.email || !row.role) {
          alert("Please enter both email and role for all rows.");
          return;
        }
        try {
          const response = await fetch(`${VITE_API_URL}/chatbot/invite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: token,
            },
            body: new URLSearchParams({
              email: row.email,
              role: row.role,
            }),
          });
          
          const result = await response.text();
          if (!response.ok) {
            alert(`Failed to invite ${row.email}: ${result}`);
          } else {
            console.log(`Invitation sent to ${row.email}`);
          }
        } catch (error) {
          console.error("Error sending invitation:", error);
          alert(`Error sending to ${row.email}`);
        }
      }
      alert("Invitations sent!");
    };

    
        
  return (
   <>
   <CCardHeader>Add Members</CCardHeader>

   <CCardBody className="p-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
  
   <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
     <CTable>
       <CTableHead>
         <CTableRow>
             
           <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width: '50%' }}>
           Email
           </CTableHeaderCell>
           <CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7', width: '40%' }}>
             Role
           </CTableHeaderCell>
           {editUserId ? (<CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>
            </CTableHeaderCell>):
           (<CTableHeaderCell scope="col" style={{ backgroundColor: '#F3F4F7' }}>
             Action
           </CTableHeaderCell>)}
         </CTableRow>
       </CTableHead>
       {editUserId ? (
  <CTableBody>
    <CTableRow>
      <CTableDataCell>
        <CFormInput
          type="email"
          placeholder="Enter the email address"
          style={{ width: '90%' }}
          value={editRow?.email || ''}
          onChange={(e) => setEditRow({ ...editRow, email: e.target.value })}
        />
      </CTableDataCell>
      <CTableDataCell>
        <div className="d-flex gap-4">
          <div>
            <input
              type="radio"
              value="ADMIN"
              checked={editRow?.role === 'ADMIN'}
              onChange={(e) => setEditRow({ ...editRow, role: e.target.value })}
            />
            <label className="ms-2">Admin</label>
          </div>
          <div>
            <input
              type="radio"
              value="AGENT"
              checked={editRow?.role === 'AGENT'}
              onChange={(e) => setEditRow({ ...editRow, role: e.target.value })}
            />
            <label className="ms-2">Agent</label>
          </div>
        </div>
      </CTableDataCell>
     
      <CTableDataCell>

      </CTableDataCell>
    </CTableRow>
  </CTableBody>
) : (
       <CTableBody>
         {rows.map((row, index) => (
          <CTableRow key={index}>
            <CTableDataCell>
              <CFormInput
                type="email"
                placeholder="Enter the email address"
                style={{ width: '90%' }}
                value={row.email}
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index].email = e.target.value;
                  setRows(updated);
                }}
              />
            </CTableDataCell>

            <CTableDataCell>
              <div className="d-flex gap-4">
                <div>
                  <input
                    type="radio"
                    id={`admin-${index}`}
                    name={`role-${index}`}
                    value="admin"
                    checked={row.role === 'admin'}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index].role = e.target.value;
                      setRows(updated);
                    }}
                  />
                  <label htmlFor={`admin-${index}`} className="ms-2">Admin</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id={`agent-${index}`}
                    name={`role-${index}`}
                    value="agent"
                    checked={row.role === 'agent'}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index].role = e.target.value;
                      setRows(updated);
                    }}
                  />
                  <label htmlFor={`agent-${index}`} className="ms-2">Agent</label>
                </div>
              </div>
            </CTableDataCell>

            <CTableDataCell>
              {rows.length > 1 && (
                <FaTrash
                  className="me-3 p-2"
                  style={{
                    backgroundColor: '#F42A2A',
                    color: 'white',
                    fontSize: '30px',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleDeleteRow(index)}
                />
              )}
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
       )}
    </CTable>

    {!editUserId &&(
    <div className="d-flex justify-content-end mt-3">
      <CButton style={{ backgroundColor: '#F3F4F7', border: '1px solid black' }} onClick={handleAddRow}>
        <FaPlus className="me-2" />
        Add Another
      </CButton>
    </div>
    )}
  </div>

  <hr/>
  {/* Footer buttons inside the card */}
  <div style={{  display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
   
  <CButton
      style={{ backgroundColor: '#F3F4F7', border: '1px solid #79747E' }}
      onClick={onCancel}
    >
      Cancel
    </CButton>
    {editUserId ? (
   <CButton
   style={{ backgroundColor: '#5856D6', color: '#FFFFFF' }}
   disabled={editRow?.status === true}
   onClick={handleUpdateAdmin}
 >
   Resend
 </CButton>
 
    ):(
    <CButton
      style={{ backgroundColor: '#5856D6', color: '#FFFFFF' }}
      onClick={handleSendInvitations}
    >
      Send
    </CButton>
    )}
  </div>

</CCardBody>
  

   </>
  )
}

export default AddMember