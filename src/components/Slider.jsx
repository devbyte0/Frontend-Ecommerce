
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import axios from 'axios';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';


// import required modules

import {  Autoplay,EffectCoverflow, Pagination } from 'swiper/modules';
import { useEffect, useState } from 'react';
import SliderImages from './SliderImages';

export default function Slider() {

    const [NewData,setNewData] = useState([]);

    const [Loading,setLoading] = useState(true);

    async function getImages(){
        setLoading(true);

        
      }

      useEffect(() => {
            getImages()
      }, []);
console.log(NewData)
  return (
    <>
      <Swiper
        autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
        slidesPerView={3}
        breakpoints={{
            300:{
                slidesPerView: 1,
                spaceBetween: 0,
            },
            640: {
              slidesPerView: 1,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 0,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 0,
            },
          }}
        centeredSlides={true}
        spaceBetween={0}
        loop={true}
        effect={'coverflow'}
        grabCursor={true}
        
        
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        modules={[Autoplay,EffectCoverflow, Pagination]}
        className="mySwiper"
      >
        
         {
            NewData.map((info) => (
                <SwiperSlide className='flex items-center justify-center'><SliderImages key={info.id} ImageInfo={info}/></SwiperSlide>
            ))
          } 
        

      </Swiper>
    </>
  );
}
