import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MembersList from './MemberList';
import AddMember from './AddMember';
import { useLocation } from 'react-router-dom';
import VITE_API_URL from '../../../Config';

const Members = () => {
  const [isOpenAddMember, setIsOpenAddMember] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [rows, setRows] = useState([{ email: '', role: '' }]);
  const [editId,setEditId] = useState();

  
  const handleEdit = (adminId) =>{
    setEditId(adminId);
}
console.log('admin',editId)

  const token = sessionStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    fetchAdmins();
  }, []);

   // Reset to MembersList when path changes to property-members
   useEffect(() => {
    if (location.pathname.endsWith('/property-members')) {
      setIsOpenAddMember(false);
      setEditId(undefined)
      fetchAdmins();
    }
  }, [location]);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getAllAdmin`);
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
    }
  };

  return (
    <>
      {isOpenAddMember || editId ? (
        <AddMember
          rows={rows}
          setRows={setRows}
          // admins={admins}
          // setAdmins={setAdmins}
          token={token}
          editUserId={editId}
          onCancel={() => {
             setIsOpenAddMember(false);
             setEditId(undefined)
             fetchAdmins()
          }}
        />
      ) : (
        <MembersList
          admins={admins}
          token={token}
          onAddMemberClick={() => setIsOpenAddMember(true)}
          refreshAdmins={fetchAdmins}
          Edit={handleEdit}
        />
      )}
    </>
  )
}

export default Members