
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Usersidebar from './usersidebar'
import { useNavigate } from 'react-router-dom';
import Footer from './Footer'
import API_URL from '../Config';
// import '../css/style.css';

function VideoHomescreen() {

    const [vimage, setvImage] = useState([]);
    // const [audios, setAudios] = useState([]);
    const navigate = useNavigate();
    const [deleteStatus] = useState(null);
    const [all, setall] = useState(null);


    useEffect(() => {
      fetchData();
    }, [deleteStatus]);
  
    useEffect(() => {
     
  
      // fetch category data from the backend
      fetch(`${API_URL}/api/v2/videogetall`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setall(data);
          console.log(data)
        })
        .catch(error => {
          console.error('Error fetching data:', error);
    throw error;

        });
  
  
  
  
    }, []);
  
    
  
    const fetchData = async () => {
      
  
      // ------------------------------------------------------------------------------------
      try {
        // Fetch image data
        const response = await fetch(`${API_URL}/api/v2/GetvideoThumbnail`);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data && Array.isArray(data)) {
          setvImage(data);
          console.log("in homescreen"+vimage);
        } else {
          console.error('Invalid or empty data received:', data);
        }
      } catch (error) {
        console.error('Error fetching or processing image data:', error);
    throw error;

      }
    };
    const Navigation = (Id) => {
        // Set localStorage item
        localStorage.setItem('items', Id);
        const items = localStorage.getItem('items');
        console.log(items); // Log the updated value of items
        // Navigate to the desired route
        navigate('/admin/Watch');
    };
    
    useEffect(() => {
      console.log(deleteStatus);
    }, [deleteStatus]);
  
    // const fetchAudios = async () => {
    //   try {
    //     const response = await axios.get(`${API_URL}/api/v2/audio/list`);
    //     setAudios(response.data);
    //   } catch (error) {
    //     console.error('Error:', error);
    //   }
    // };
  
  return (


            <div class="work_user">
                <div class="row">
                < Usersidebar/>
                <div className='body-m-user'>
                {/* <Video/> */}
        <section className='head-1-user'>
        <section class="hero">
<div class="hero__slider_user owl-carousel_user">
<div class="hero__item_user set-bg_user">
{all && all.map((item, index) => {
    if (index === 0) {
        return (
            <Link className="Link" to={{
                pathname: `/admin/Watch`,
                state: { get: item },
            }} key={index}>
                <img src={`data:image/png;base64,${vimage[index]}`} className="im_1_user" alt="Responsive image" />
            </Link>
        );
    } else {
        // handle else case if needed
        return null; // or any other fallback
    }
})}
</div>
</div>
</section>

        </section>
    <section class="work_user">
    <div className='Wording_user'>
       VideoHomescreen
    </div>
    <div className=' grid_1_user'>
        {/* <div className="scroll__container"> */}
        {
        all && all.length > 0 ? (
    all.map((get, index) => (
      
        
        <Link className="Link" onClick={() => Navigation(get.id)} to={{pathname: `/admin/Watch`}}>
            <div class="col-lg-2 col-md-2 col-sm-2 col-2 wo_u work__item_user">
            
                <img src={`data:image/png;base64,${vimage[index]}`} class="im_u"   alt={`Image ${index + 1}`} />
                <div class="work__item__hover_user">
                    <h4>{get.moviename}</h4>
                    <ul>
                    <h4> <li>{get.category}</li></h4>
                    <h4>  <li>{get.language}</li></h4>
                    </ul>
                </div>
                
            </div>
            </Link>
            ))
        )
  : (
    <p>No audios found.admin</p>
  )
  }
           
        {/* </div> */}
    
        {/* </div> */}
    </div>
</section>
<Footer/>
                </div>
       
    
    
    </div>
            </div>
        

   
    

)}

export default VideoHomescreen