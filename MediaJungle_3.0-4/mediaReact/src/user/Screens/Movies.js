import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout/Layout';
import API_URL from '../../Config';
import axios from 'axios';
import leftarrowIcon from '../UserIcon/left slide icon.png';
import rightarrowIcon from '../UserIcon/right slide icon.png';
import { Link, useNavigate } from 'react-router-dom';

const MoviesPage = () => {
  const [states, setStates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({}); // Per-category scroll index
  const [videoBanners, setVideoBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const userid = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  // ✅ FIX: Use per-category refs instead of a single querySelector('.items')
  const itemRefs = useRef({});

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Fetch video banners
  const fetchVideoBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/getallvideobanners`);
      setVideoBanners(response.data);
      console.log('videoBanners', response.data);
    } catch (error) {
      // ✅ FIX: Removed "throw error" — a banner fetch failure should not crash the page
      console.error('Error fetching video banners:', error);
    }
  };

  // Fetch video container categories
  const fetchVideoContainer = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/getvideocontainer`);
      setStates(response.data);
      console.log('videocontainer', response.data);
    } catch (error) {
      // ✅ FIX: Removed "throw error" — a container fetch failure should not crash the page
      console.error('Error fetching video container:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVideoBanners();
    fetchVideoContainer();
  }, []);

  // Auto-advance banner; guard against empty array to avoid NaN modulo
  useEffect(() => {
    if (videoBanners.length === 0) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % videoBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [videoBanners.length]);

  const handleEdit = (id, categoryid) => {
    localStorage.setItem('items', JSON.stringify({ id, categoryid }));
    window.scrollTo(0, 0);
  };

  // ✅ FIX: Scroll the specific category's items container by its ref
  const handleNext = (categoryValue) => {
    const container = itemRefs.current[categoryValue];
    if (container) {
      container.scrollLeft += container.offsetWidth;
    }
  };

  const handlePrevious = (categoryValue) => {
    const container = itemRefs.current[categoryValue];
    if (container) {
      container.scrollLeft -= container.offsetWidth;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p style={{ color: 'white', fontSize: '18px' }}>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Banner Section */}
      <div className="banner-container mt-3">
        {videoBanners.length > 0 && (
          <div
            className="banner-items"
            style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
          >
            {videoBanners.map((banner, index) => (
              <div
                key={index}
                className="banner-item"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  // ✅ FIX: store same JSON format as handleEdit so WatchPage parses correctly
                  localStorage.setItem('items', JSON.stringify({ id: banner.videoId, categoryid: null }));
                  window.scrollTo(0, 0);
                  window.location.href = `/watchpage/${banner.videoId}`;
                }}
              >
                <img
                  src={`${API_URL}/api/v2/${banner.videoId}/videoBanner`}
                  alt={`Banner ${index}`}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Categories */}
      <div className="container-list">
        {states.length === 0 ? (
          <div style={{ color: 'white', textAlign: 'center', marginTop: '40px' }}>
            No content available. Please upload videos from the admin panel.
          </div>
        ) : (
          states.map((state) => {
            const videoDescriptions = state.videoDescriptions || [];

            if (videoDescriptions.length === 0) return null; // Skip empty categories

            return (
              <div key={state.value}>
                <div className="customcontainer">
                  <span>{state.value}</span>
                  <div className="navigation">

                    {/* ✅ FIX: Pass category value to know which container to scroll */}
                    <button onClick={() => handlePrevious(state.value)}>
                      <img
                        src={leftarrowIcon}
                        alt="left arrow"
                        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      />
                    </button>

                    {/* ✅ FIX: Assign a ref per category using the category value as key */}
                    <div
                      className="items"
                      ref={(el) => { itemRefs.current[state.value] = el; }}
                      style={{ overflowX: 'auto', scrollBehavior: 'smooth' }}
                    >
                      {videoDescriptions.map((video, index) => (
                        <div
                          key={`${video.id}-${state.value}-${index}`}
                          className="item"
                        >
                          <Link
                            to={userid ? `/watchpage/${video.videoTitle}` : '/UserLogin'}
                            onClick={() => handleEdit(video.id, state.categoryid)}
                          >
                            <img
                              src={`${API_URL}/api/v2/${video.id}/videothumbnail`}
                              alt={video.videoTitle || `Video ${video.id}`}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </Link>
                          <p>{video.videoTitle}</p>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => handleNext(state.value)}>
                      <img
                        src={rightarrowIcon}
                        alt="right arrow"
                        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      />
                    </button>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default MoviesPage;