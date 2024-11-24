import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
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
                    <SliderImages ImageInfo={slide} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default Slider;
