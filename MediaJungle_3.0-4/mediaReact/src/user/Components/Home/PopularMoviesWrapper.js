import React from 'react';
import PopularMovies from './PopularMovies';

const PopularMoviesWrapper = ({ showPrevArrow }) => {
  return (
    <div>
      <PopularMovies showPrevArrow={showPrevArrow} />
    </div>
  );
};

export default PopularMoviesWrapper;
