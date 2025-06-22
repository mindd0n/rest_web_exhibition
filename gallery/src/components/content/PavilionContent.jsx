import React, { useState } from 'react';
import './PavilionContent.css';
import LittleForest from './svg/LittleForest';
// 다른 SVG 컴포넌트 import
// import ForrestGump from './svg/ForrestGump';
// import KamomeKitchen from './svg/KamomeKitchen';
// import PerfectDays from './svg/PerfectDays';
// import AdultKim from './svg/AdultKim';

const movies = [
  {
    id: 1,
    title: "리틀 포레스트",
    poster: "/assets/content/btn_p_pavilion/G.영화추천리스트/리틀포레스트.png",
    description: "/assets/content/btn_p_pavilion/G.영화추천리스트/리틀포레스트 설명파일.png",
    year: "2018",
    genre: "드라마",
  },
  {
    id: 2,
    title: "포레스트 검프",
    poster: "/assets/content/btn_p_pavilion/G.영화추천리스트/포레스트검프.png",
    description: "/assets/content/btn_p_pavilion/G.영화추천리스트/포레스트 설명파일.png",
    year: "1994",
    genre: "드라마",
  },
  {
    id: 3,
    title: "카모메 식당",
    poster: "/assets/content/btn_p_pavilion/G.영화추천리스트/카모메식당.png",
    description: "/assets/content/btn_p_pavilion/G.영화추천리스트/카모메식당 설명파일.png",
    year: "2015",
    genre: "드라마",
  },
  {
    id: 4,
    title: "퍼펙트 데이즈",
    poster: "/assets/content/btn_p_pavilion/G.영화추천리스트/퍼펙트데이즈.png",
    description: "/assets/content/btn_p_pavilion/G.영화추천리스트/퍼펙트데이즈 설명파일.png",
    year: "2023",
    genre: "드라마",
  },
  {
    id: 5,
    title: "어른 김장한",
    poster: "/assets/content/btn_p_pavilion/G.영화추천리스트/어른 김장한.png",
    description: "/assets/content/btn_p_pavilion/G.영화추천리스트/어른김장하 설명파일.png",
    year: "2022",
    genre: "드라마",
  }
];

const PavilionContent = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleBackClick = () => {
    setSelectedMovie(null);
  };

  const listBgUrl = '/assets/content/btn_p_pavilion/G.영화추천리스트/pavilion_bg_list.png';

  return (
    <div
      className="movie-app-container"
      style={{ backgroundImage: `url(${listBgUrl})` }}
    >
      {/* 1단계: 영화 목록 */}
      <div className="movie-list">
        <div className="poster-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="movie-poster-item"
              onClick={() => handleMovieClick(movie)}
            >
              <img src={movie.poster} alt={movie.title} />
            </div>
          ))}
        </div>
      </div>

      {/* 2단계: 상세 이미지 오버레이 */}
      {selectedMovie && (
        <div 
          className="movie-detail-overlay" 
          onClick={handleBackClick}
          style={{ backgroundImage: `url(${selectedMovie.description})` }}
        >
          {/* 이미지는 배경으로 처리되므로, img 태그는 필요 없습니다. */}
        </div>
      )}
    </div>
  );
};

export default PavilionContent; 