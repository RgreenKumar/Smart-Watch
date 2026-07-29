import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../Config';

const UserNotification = ({ setisopen, isopen, setcount, handlemarkallasRead }) => {
    const [notifications, setnotifications] = useState([]);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/usernotifications`, {
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
        // ✅ FIX 1: Removed "throw error" — unhandled rejection crashed the page
        console.error('Error fetching data:', error);
      }
    };

    if (isopen) {
      fetchItems();
    }
  }, [isopen, setcount, token]);

  const handleClearAll = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/clearAlluser`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      // ✅ FIX 2: Removed "throw error" — unhandled rejection crashed the page
      console.error('Error clearing notifications:', error);
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
  className="shadow-md p-4 bg-blue-950 text-red-500 rounded-md fixed top-0 right-0 w-600px h-600px mt-24 mr-6 custom-scrollbar"
  style={{width:"500px",height:"250"}}
>
  <div className="flex justify-between items-center mb-8">
    <a href='#' onClick={handleClearAll} className="text-main hover:underline"  >Clear All</a>&nbsp;
    <a href='#' onClick={() => handlemarkallasRead()} className="text-main hover:underline" >Mark All as Read</a>
    <i className="fa-solid fa-xmark  cursor-pointer text-white" style={{marginTop:"0px",paddingTop:"0px"}} onClick={() => setisopen(false)}></i>
  </div>
  <div className="overflow-y-auto pr-2 max-h-64">
    {filteredNotifications && filteredNotifications.length > 0 ? (
      filteredNotifications.map((group, index) => (
        <div key={index} className="mb-4">
          <h6 className="text-left text-red-500">
            {group.date === new Date().toLocaleDateString('en-US') ? 'Today' :
              group.date === new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US') ? 'Yesterday' :
                group.date}
          </h6>
          {group.notifications.map((notification, notificationIndex) => (
            <div
              key={notificationIndex}
              className="flex items-start p-2 hover:bg-blue-900 cursor-pointer"
              onClick={() => { window.location.href = `${notification.link}`; }}
            >
              {notification.notimage && (
                <img
                  src={`data:image/jpeg;base64,${notification.notimage}`}
                  alt="pic"
                  className="mr-3 w-24 h-28 object-cover"
                />
              )}
              <div className='p-1'>
                <p className="text-red-500">{notification.heading}</p>
                <small className="text-red-500" style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
                {notification.description && notification.description.length > 50 ? `${notification.description.substring(0, 50)}...` : notification.description}
                </small>
                <p className="text-red-500">{notification.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ))
    ) : (
      <div className='text-center mt-5 text-white'> No Notification Found</div>
    )}
  </div>
</div>



  )
}

export default UserNotification