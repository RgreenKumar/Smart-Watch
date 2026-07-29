import React, { useState, useEffect } from 'react';
import Layout from './Layout/Layout'

import API_URL from '../Config'
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';
import Titles from './Components/Titles';
import { FaUserFriends } from 'react-icons/fa'
// import Carousel from 'react-carousel';
// import 'react-carousel/lib/carousel.css'; // Make sure to import the carousel styles
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons for arrows
import { useNavigate } from 'react-router-dom';


  // Custom previous arrow component
  const CustomPrevArrow = (props) => (
    <div {...props} className="slick-arrow slick-prev">
      <FaChevronLeft />
    </div>
  );

  // Custom next arrow component
  const CustomNextArrow = (props) => (
    <div {...props} className="slick-arrow slick-next">
      <FaChevronRight />
    </div>
  );

const VideoScreen = () => {
  const navigate = useNavigate();

  const id = localStorage.getItem('items');
  console.log("id",id)

  const [getall,setgetall] = useState('');
  const [Thumbnail,setThumbnail] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/GetvideoDetail/${id}`);
      setgetall(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    throw error;

    }
  };

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/GetThumbnailsById/${id}`);
        if (response.data) {
          // Assuming your endpoint returns a list with a single Base64-encoded thumbnail
          setThumbnail(response.data);
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
    throw error;

      }
    };

    fetchThumbnail();
  }, [id]);

useEffect(() => {
fetchData();
}, [id]);

// const images = [
//   { id: 1, src: siva, alt: 'Image 1' },
//   { id: 2, src: siva, alt: 'Image 2' },
//   { id: 3, src: siva, alt: 'Image 3' },
//   { id: 4, src: siva, alt: 'Image 4' },
//   { id: 5, src: siva, alt: 'Image 5' },
// ];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay:true,
  autoplaySpeed:3000,
  arrows:false,
  prevArrow: <CustomPrevArrow />, // Custom previous arrow component
  nextArrow: <CustomNextArrow />, // Custom next arrow component
  };

  const handlePage = (Id,moviename) => {
    localStorage.setItem('items', Id);
    navigate(`/watchpage/${moviename}`)
  };
  
  return (
   
    <Layout className='container mx-auto min-h-screen overflow-y-auto'>

<div className='w-full h-96 rounded-lg overflow-hidden relative border-2 border-yellow-500' style={{ height: '750px' }}>
  <div className='absolute top-0 left-0 bottom-0 right-0 bg-blue-500 bg-opacity-10'></div>
  <img src={`data:image/png;base64,${Thumbnail}`} alt={getall.moviename} className='w-full h-200 object-cover' />
  <div className='absolute bottom-0 right-0 left-0 p-20 flex flex-col justify-end gap-4 '>
   
    <button className="bg-subMain hover:text-main transitions text-white px-2 py-3 rounded font-medium sm:text-sm text-xs inline-flex items-center" style={{ width: '15%',justifyContent:'center' }} onClick={() => {handlePage(getall.id,getall.moviename)}}>
    <FaPlay className='w-3 h-3 mr-1' />Watch
    </button>
     <h1 className='text-xl sm:text-2xl xl:text-2xl truncate capitalize font-bold text-white'>
      Duration: {getall.duration}
    </h1> 
  </div>
</div>
<h1 className='text-xl sm:text-4xl xl:text-3xl truncate capitalize font-bold text-white' style={{margin:'40px 0 0 60px'}}>
      {getall.moviename}
    </h1>

    <h1 className='text-xl sm:text-4xl xl:text-3xl truncate capitalize font-bold text-white' style={{margin:'40px 0 0 60px'}}>
      {getall.year} {getall.category}
    </h1>


        {/* Example: */}        
        {/* <h1 className='text-xl sm:text-4xl xl:text-3xl truncate capitalize font-bold text-white' style={{margin:'40px 0 0 60px'}}>
           Cast and Crew
         </h1> */}
        <div style={{ margin: '40px 0 0 0' }}>
  <Titles title="Cast and Crew" Icon={FaUserFriends} />
</div>
{/* Image Gallery Section */}
<div className="slider-container" style={{marginTop:'10px'}}>
  <Slider {...settings}>
    {/* {images.map((image, index) => (
      <div key={index} className="slider-item">
        <div className='hover:scale-95 transitions  w-full p-3 italic text-xs text-text rounded flex-colo bg-dry border border-gray-800 overflow-hidden' style={{ height: '100%' ,width:'80%',marginLeft:'10px'}}>
          <img src={image.src} alt={image.alt}  className='w-full h-64 object-cover rounded mb-4' />
          <p>Siva</p>
        </div>
      </div>
    ))} */}
  </Slider>
</div>
     </Layout>
  )
}

export default VideoScreen