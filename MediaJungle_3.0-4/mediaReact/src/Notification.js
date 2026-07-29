import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from './Config';

const Notification = ({ setisopen, isopen, setcount, handlemarkallasRead }) => {
  const [notifications, setnotifications] = useState([]);
  const token = sessionStorage.getItem('tokenn');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/notifications`, {
          headers: {
            Authorization: token,
          },
        });
        if (response.status === 200) {
          const data = response.data;
          setnotifications(data);
          console.log(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error
      }
    };

    if (isopen) {
      fetchItems();
    }
  }, [isopen, setcount, token]);

  const handleClearAll = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/clearAll`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error
    }
  };

  const filteredNotifications = React.useMemo(() => {
    if (!notifications || !notifications.length) return [];

    const groupedByDate = notifications.reduce((acc, notification) => {
      const formattedDate = new Date(notification.createdDate).toLocaleDateString('en-US'); // Format date for grouping
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(notification);
      return acc;
    }, {});

    
    // Convert grouped notifications to array and sort by date (descending)
    const sortedNotifications = Object.entries(groupedByDate)
      .map(([date, notificationsByDate]) => ({ date, notifications: notificationsByDate }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return sortedNotifications;
  }, [notifications]);

  return (
    <div
      id="notipanel"
      className="notificationPanel dropdown-menu-right shadow animated--grow-in"
    >
      <div className="headcontrols d-flex justify-content-between align-items-center">
        <a href='#' onClick={handleClearAll} className="btn btn-link">Clear All</a>
        <a href='#' onClick={() => {
          handlemarkallasRead();
        }} className="btn btn-link">Mark All as Read</a>

        <i className="fa-solid fa-xmark p-1" onClick={() => setisopen(false)}></i>
      </div>
      <div className="scrollclass pr-2">
        {filteredNotifications && filteredNotifications.length > 0 ? (
          filteredNotifications.map((group, index) => (
            <div key={index}>
              <h6 className="text-left text-muted">
                {group.date === new Date().toLocaleDateString('en-US') ? 'Today' :
                  group.date === new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US') ? 'Yesterday' :
                    group.date}
              </h6>
              {group.notifications.map((notification, notificationIndex) => (
                <div key={notificationIndex} className="notificationElement dropdown-item d-flex align-items-start" onClick={() => { window.location.href = `${notification.link}`; }}>
                  {notification.notimage && (
                    <img src={`data:image/jpeg;base64,${notification.notimage}`} alt="pic" className="mr-3" width="100px" height="120px" />
                  )}
                  <div className='p-1'>
                    <p><b>{notification.heading}</b></p>
                    <small className="text-muted">Created By {notification.username}</small>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : <div className='text-center mt-5'> No Notification Found</div>}
      </div>
    </div>
  );
}

export default Notification;
