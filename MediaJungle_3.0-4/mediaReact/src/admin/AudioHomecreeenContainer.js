import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import API_URL from '../Config';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useRef } from 'react';
import ManualSlider from './ManualSliderTest';

const AudioHomecreeenContainer = () => {
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0); // Manage the current slide index
 
    useEffect(() => {
        fetch(`${API_URL}/api/v2/audioContainerDetails`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            setMovies(data);
            setCategories(data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            throw error;
          });
      }, []);
    //  useEffect(() => {
    //   // Mock movie data
    //   const mockMovies = [
    //     { id: 36, movieName: "007", cate: "Action" },
    //     { id: 37, movieName: "Mass", cate: "Romantic" },
    //     { id: 39, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 40, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 41, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 42, movieName: "Titanic", cate: "Romantic" },
    //     { id: 43, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 44, movieName: "The Matrix", cate: "Sci-Fi" },
    //     { id: 45, movieName: "007", cate: "Action" },
    //     { id: 46, movieName: "Mass", cate: "Romantic" },
    //     { id: 48, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 49, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 50, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 51, movieName: "Titanic", cate: "Romantic" },
    //     { id: 52, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 53, movieName: "007", cate: "Action" },
    //     { id: 54, movieName: "Mass", cate: "Romantic" },
    //     { id: 55, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 57, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 58, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 59, movieName: "Titanic", cate: "Romantic" },
    //     { id: 60, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 61, movieName: "007", cate: "Action" },
    //     { id: 62, movieName: "Mass", cate: "Romantic" },
    //     { id: 63, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 64, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 66, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 67, movieName: "Titanic", cate: "Romantic" },
    //     { id: 68, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 69, movieName: "007", cate: "Action" },
    //     { id: 70, movieName: "Mass", cate: "Romantic" },
    //     { id: 71, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 72, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 73, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 74, movieName: "Titanic", cate: "Romantic" },
    //     { id: 75, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 76, movieName: "007", cate: "Action" },
    //     { id: 77, movieName: "Mass", cate: "Romantic" },
    //     { id: 78, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 79, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 81, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 82, movieName: "Titanic", cate: "Romantic" },
    //     { id: 83, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 86, movieName: "007", cate: "Action" },
    //     { id: 87, movieName: "Mass", cate: "Romantic" },
    //     { id: 89, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 80, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 84, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 85, movieName: "Titanic", cate: "Romantic" },
    //     { id: 88, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 96, movieName: "007", cate: "Action" },
    //     { id: 97, movieName: "Mass", cate: "Romantic" },
    //     { id: 99, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 90, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 91, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 92, movieName: "Titanic", cate: "Romantic" },
    //     { id: 93, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 94, movieName: "007", cate: "Action" },
    //     { id: 95, movieName: "Mass", cate: "Romantic" },
    //     { id: 98, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 100, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 101, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 42, movieName: "Titanic", cate: "Romantic" },
    //     { id: 43, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 36, movieName: "007", cate: "Action" },
    //     { id: 37, movieName: "Mass", cate: "Romantic" },
    //     { id: 39, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 40, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 41, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 42, movieName: "Titanic", cate: "Romantic" },
    //     { id: 43, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 36, movieName: "007", cate: "Action" },
    //     { id: 37, movieName: "Mass", cate: "Romantic" },
    //     { id: 39, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 40, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 41, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 42, movieName: "Titanic", cate: "Romantic" },
    //     { id: 43, movieName: "Avatar", cate: "Fantasy" },
    //     { id: 36, movieName: "007", cate: "Action" },
    //     { id: 37, movieName: "Mass", cate: "Romantic" },
    //     { id: 39, movieName: "The Dark Knight", cate: "Action" },
    //     { id: 40, movieName: "Inception", cate: "Sci-Fi" },
    //     { id: 41, movieName: "Interstellar", cate: "Sci-Fi" },
    //     { id: 42, movieName: "Titanic", cate: "Romantic" },
    //     { id: 43, movieName: "Avatar", cate: "Fantasy" },
    //   ];
  
    //   // Simulating an API call by setting the data with a delay
    //   setTimeout(() => {
    //     setMovies(mockMovies);
    //   }, 1000);
    // }, []);
console.log(movies.length);
console.log(movies);

// const goNext = () => {
//   if (currentIndex < totalSlides - slidesToShow) {
//     setCurrentIndex(currentIndex + 1);
//   }
// };

// // Move to the previous slide
// const goPrev = () => {
//   if (currentIndex > 0) {
//     setCurrentIndex(currentIndex - 1);
//   }
// };
// const totalSlides = category.audiolist.length;
// const slidesToShow = 6; // Show 6 images at a time
    // Slider settings for react-slicke for the slider

    // const sliderRef = useRef(null); // Create a reference for the slider

    // const settings = {
    //   dots: true,
    //   infinite: false,
    //   speed: 500,
    //   slidesToShow: 6, // Show 6 images at a time
    //   slidesToScroll: 1,
    //   responsive: [
    //     {
    //       breakpoint: 1024,
    //       settings: {
    //         slidesToShow: 3,
    //       }
    //     },
    //     {
    //       breakpoint: 600,
    //       settings: {
    //         slidesToShow: 2,
    //       }
    //     },
    //     {
    //       breakpoint: 480,
    //       settings: {
    //         slidesToShow: 1,
    //       }
    //     }
    //   ]
    // };
  
    // // Move slider forward
    // const goNext = () => {
    //   if (sliderRef.current) {
    //     sliderRef.current.slickNext(); // Move to the next slide
    //   }
    // };
  
    // // Move slider backward
    // const goPrev = () => {
    //   if (sliderRef.current) {
    //     sliderRef.current.slickPrev(); // Move to the previous slide
    //   }
    // };
  

  // const settings = {
  //   dots: true,       // Enable pagination dots
  //   infinite: true,   // Enable infinite loop scrolling
  //   speed: 500,       // Transition speed
  //   slidesToShow: 6,  // Number of images to show at once
  //   slidesToScroll: 1 // Scroll 1 image at a time
  // };
    {/* <Slider {...settings}>
      {movies.slice(0, movies.length).map(movie => (
        <div key={movie.id} className="movie-card">
          <img src={`${API_URL}/api/v2/image/${movie.id}`} alt={movie.movieName} style={{ width: '100%', height: 'auto' }} />
          <h3>{movie.movieName}</h3>
          <p>{movie.cate}</p>
        </div>
      ))}
    </Slider> */}
    {/* <Slider {...settings}>
{category.audiolist.map(movie => (
  <div key={movie.id} className="image-slide">
    <img src={`${API_URL}/api/v2/image/${movie.id}`} alt={movie.movieName} style={{ width: '100%', height: 'auto' }} />
    <h3>{movie.audio_title}</h3>
    <p>{movie.certificate_name}</p>
  </div>
))}
</Slider> */}

  return (
//     <div>
//     <h2>Movie Slider</h2>
  
//       {categories.map((category, index) => (
//         category.audiolist.length >= 0 && ( // Only display slider if audiolist is not empty
//           <div key={index}>
//             <h3>{category.category_name}</h3> {/* Category name */}
//             <div className="slider-container">
//       <button className="prev-button" onClick={goPrev}>Previous</button> {/* Custom Previous Button */}
      
//       <Slider ref={sliderRef} {...settings}> {/* Attach ref to Slider */}
//         {category.audiolist.map(movie => (
//           <div key={movie.id} className="movie-card">
//             <img src={`${API_URL}/api/v2/image/${movie.id}`} alt={movie.movieName} style={{ width: '100%', height: 'auto' }} />
//             <h3>{movie.audio_title}</h3>
//             <p>{movie.certificate_name}</p>
//           </div>
//         ))}
//       </Slider>

//       <button className="next-button" onClick={goNext}>Next</button> {/* Custom Next Button */}
//     </div>

// </div>
//         )
//       ))}





//   </div>
<div>
<h2>Movie Sliders</h2>
{categories.map((category, index) => (
  category.audiolist.length > 0 && ( // Only render the slider if audiolist is not empty
    <div key={index}>
      <h3 className='custom-label'>{category.category_name}</h3>
      <ManualSlider category={category} API_URL={API_URL} /> {/* Pass each category to the slider */}
    </div>
  )
))}
</div>



);
};

export default AudioHomecreeenContainer
