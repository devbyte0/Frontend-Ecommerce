import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import SliderImages from './SliderImages';
import axios from 'axios';

const Slider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/slides`);
        setSlides(response.data);
      } catch (err) {
        setError('Failed to load slides.');
        console.error("Error fetching slides:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="w-full mx-auto max-w-screen-xl py-4 px-2">
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-white rounded-xl shadow-lg border border-yellow-200 p-2 md:p-4">
        <Swiper
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          grabCursor={true}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 10 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide._id} className="flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md border border-yellow-100 p-2 hover:shadow-xl transition-all duration-200">
                  <SliderImages ImageInfo={slide} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Slider;
