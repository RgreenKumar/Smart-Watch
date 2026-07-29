import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';
import usericon from '../admin/icon/userico.png';
import music from '../admin/icon/music.png';
import coin from '../admin/icon/coin.png';
import videoicon from '../admin/icon/videoicon.png';
import arrow from '../admin/icon/arrow.png'

const Dashboard = () => {
  const [isvalid, setIsvalid] = useState();
  const [isEmpty, setIsEmpty] = useState();
  const [all, setall] = useState(null);
  const [getall, setGetall] = useState(null);
  const [GetUser, setGetUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [getuser, setgetuser] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllUser`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setIsEmpty(data.empty);
        setIsvalid(data.valid);
      })
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching user validity:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/video/getall`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setall(data))
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching all videos:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/video/getall`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const lastThreeVideos = data.slice(-3);
        setVideos(lastThreeVideos);
        lastThreeVideos.forEach(video => {
          fetch(`${API_URL}/api/v2/videoimage/${video.id}`)
            .then(response => response.json())
            .then(data => {
              setThumbnails(prevState => ({
                ...prevState,
                [video.id]: `data:image/png;base64,${data.videoThumbnail}`,
              }));
            })
            .catch(error => {
              // ✅ FIX: Removed "throw error"
              console.error('Error fetching video thumbnail:', error);
            });
        });
      })
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching latest videos:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/getaudiodetailsdto`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setGetall(data))
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching audios:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllUsers`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setGetUser(data))
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching all users:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/registereduserget`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setgetuser(data))
      .catch(error => {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching registered users:', error);
      });
  }, []);

  const getTimeAgo = (userDate) => {
    const currentDate = new Date();
    const givenDate = new Date(userDate);
    const timeDiff = Math.floor((currentDate - givenDate) / (1000 * 60 * 60 * 24));
    if (timeDiff === 0) return 'Today';
    if (timeDiff === 1) return 'Yesterday';
    return `${givenDate.getDate()}/${givenDate.getMonth() + 1}/${givenDate.getFullYear()}`;
  };

  return (
    <div>
      <div className="marquee-content">
        {!isvalid ? (
          <a href="/admin/About_us" style={{ color: "darkred" }}>
            License has been expired. Need to upload new License or contact "111111111111"
          </a>
        ) : <div></div>}
      </div>
      <br />

      <div className="dashboard-content">
        <div className="stats-cards">
          <div className="carddashboard">
            <h4>Total Users</h4>
            <div className="icon-text">
              <img src={usericon} alt="usericon" />
              <span>{GetUser && GetUser.length > 0 ? GetUser.length : 0}</span>
            </div>
            <a href="/admin/SubscriptionPayments" className="get-more-link">
              Get more <img src={arrow} alt="icon" className="arrow-icon" />
            </a>
          </div>

          <div className="carddashboard">
            <h4>Total Videos</h4>
            <div className="icon-text">
              <img src={videoicon} alt="icon" />
              <span>{all && all.length > 0 ? all.length : 0}</span>
            </div>
            <a href="/admin/Video" className="get-more-link">
              Get more <img src={arrow} alt="icon" className="arrow-icon" />
            </a>
          </div>

          <div className="carddashboard">
            <h4>Total Audios</h4>
            <div className="icon-text">
              <img src={music} alt="icon" />
              <span>{getall && getall.length > 0 ? getall.length : 0}</span>
            </div>
            <a href="/admin/ListAudio" className="get-more-link">
              Get more <img src={arrow} alt="icon" className="arrow-icon" />
            </a>
          </div>

          <div className="carddashboard">
            <h4>No of Accounts</h4>
            <div className="icon-text">
              <img src={coin} alt="icon" />
              <span>{GetUser && GetUser.length > 0 ? GetUser.length : 0}</span>
            </div>
            <a href="/admin/SubscriptionPayments" className="get-more-link">
              Get more <img src={arrow} alt="icon" className="arrow-icon" />
            </a>
          </div>
        </div>

        <div className="latest-sections">
          <div className="latest-users">
            <h4>Latest users <span>Last 15 Days</span></h4>
            <div className="users-list">
              {getuser.length === 0 ? (
                <p>No users found.</p>
              ) : (
                getuser.map(user => (
                  <div key={user.id} className="user-container">
                    <div className="user-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="time-ago">{getTimeAgo(user.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="latest-videos">
            <h4>Latest Videos</h4>
            {videos.map(video => (
              <div key={video.id} className="video">
                <img src={thumbnails[video.id]} alt={video.title} style={{ width: "20%" }} />
                <p>
                  <span style={{ color: 'white' }}>{video.videoTitle}</span>{' '}
                  <span>{video.mainVideoDuration}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;