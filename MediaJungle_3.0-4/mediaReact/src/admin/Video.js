import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Config';
import "../css/Sidebar.css";

const Video = () => {
  const [users, setUsers] = useState([]);
  const [category, setCategory] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('tokenn');
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleBulkOptions = () => setShowBulkOptions(prev => !prev);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedIds(checked ? users.map(u => u.id) : []);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  // ✅ FIX: Clear localStorage before navigating to Add Video (new mode)
  const handleClick = (link) => {
    localStorage.removeItem('items');
    navigate(link);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/video/getall`);
        setUsers(response.data);
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching videos:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (videoId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/api/v2/deletevideo/${videoId}`, {
            method: 'DELETE',
            headers: { Authorization: token },
          });
          if (response.ok) {
            setUsers(prev => prev.filter(u => u.id !== videoId));
            Swal.fire('Deleted!', 'The video has been deleted.', 'success');
          } else {
            Swal.fire('Error!', 'There was a problem deleting the video.', 'error');
          }
        } catch (error) {
          // ✅ FIX: Removed "throw error" — show friendly error instead
          console.error('Error deleting video:', error);
          Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        }
      }
    });
  };

  // ✅ FIX: Store plain videoId (not JSON) so AddVideo reads it correctly
  const handlEdit = (videoId) => {
    localStorage.setItem('items', videoId);
    navigate('/admin/AddVideo');
  };

  const deleteMultipleUsers = (userIds) => {
    fetch(`${API_URL}/api/v2/deleteMultiplevideos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(userIds),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok.');
        if (response.status === 204) return { message: 'Videos deleted successfully' };
        return response.json();
      })
      .then(data => {
        if (data.notFoundVideoIds && data.notFoundVideoIds.length > 0) {
          Swal.fire({ title: 'Partial Success!', text: `Some videos were not found: ${data.notFoundVideoIds.join(', ')}`, icon: 'info', confirmButtonText: 'OK' });
        } else {
          Swal.fire({ title: 'Deleted!', text: data.message || 'Videos deleted successfully!', icon: 'success', confirmButtonText: 'OK' });
        }
        setUsers(prev => prev.filter(u => !userIds.includes(u.id)));
      })
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error bulk deleting videos:', error);
        Swal.fire({ title: 'Error!', text: 'An error occurred while deleting the videos.', icon: 'error', confirmButtonText: 'OK' });
      });
  };

  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <button className='btn btn-custom' onClick={() => handleClick("/admin/AddVideo")}>Add Video</button>
      </div><br />
      <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item text-white">Videos</li>
          <li className="ms-auto text-end text-white position-relative">
            Bulk Action
            <button className="ms-2" onClick={toggleBulkOptions}>
              <i className="bi bi-chevron-down"></i>
            </button>
            {showBulkOptions && (
              <div className="bulk-options">
                <button className="btn btn-danger" style={{ color: 'black' }} onClick={() => deleteMultipleUsers(selectedIds)}>Delete</button>
              </div>
            )}
          </li>
        </ol>

        <div className="outer-container">
          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr className='table-header'>
                  <th style={{ border: 'none' }}>
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                  <th style={{ border: 'none' }}>S.No</th>
                  <th style={{ border: 'none' }}>Video Title</th>
                  <th style={{ border: 'none' }}>Production</th>
                  <th style={{ border: 'none' }}>Rating</th>
                  <th style={{ border: 'none' }}>Video Access Type</th>
                  <th style={{ border: 'none' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>
                      <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} />
                    </td>
                    <td className='truncate'>{index + 1}</td>
                    <td className='truncate' title={user.videoTitle}>
                      {user.videoTitle?.length > 20 ? `${user.videoTitle.substring(0, 10)}...` : user.videoTitle}
                    </td>
                    <td className='truncate' title={user.productionCompany}>
                      {user.productionCompany?.length > 20 ? `${user.productionCompany.substring(0, 10)}...` : user.productionCompany}
                    </td>
                    <td className='truncate' title={user.rating}>
                      {user.rating?.length > 10 ? `${user.rating.substring(0, 10)}...` : user.rating}/10
                    </td>
                    <td className='truncate'>{user.videoAccessType === true ? 'paid' : 'free'}</td>
                    <td>
                      <button onClick={() => handlEdit(user.id)} className="btn btn-primary me-2">
                        <i className="fas fa-edit" aria-hidden="true"></i>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn btn-danger">
                        <i className="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;