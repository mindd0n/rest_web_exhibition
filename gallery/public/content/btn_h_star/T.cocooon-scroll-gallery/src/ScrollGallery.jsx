import React, { useState, useEffect } from "react";

const ScrollGallery = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false); // Back 버튼 노출 제어

  const handleClick = () => {
    setShowGallery(true);
    setGalleryReady(false);

    setTimeout(() => {
      const section = document.getElementById("gallery");
      section?.scrollIntoView({ behavior: "smooth" });
      setGalleryReady(true);
    }, 100);
  };

  const images = [
    "/content/btn_h_star/T.cocooon-scroll-gallery/dist/1.jpeg",
    "/content/btn_h_star/T.cocooon-scroll-gallery/dist/2.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/dist/3.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/dist/4.JPEG",
    "/content/btn_h_star/T.cocooon-scroll-gallery/dist/5.JPEG",
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {!showGallery && (
        <button
          className="text-lg border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
          onClick={handleClick}
        >
          사진 보러 가기
        </button>
      )}

      {showGallery && (
        <div id="gallery" className="mt-10 space-y-8 px-4 pb-32 w-full">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`사진 ${index + 1}`}
              className="w-full max-w-4xl mx-auto rounded shadow"
            />
          ))}

          {galleryReady && (
            <div className="w-full flex justify-center mt-10">
              <button
                onClick={() => setShowGallery(false)}
                className="text-base border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScrollGallery;
