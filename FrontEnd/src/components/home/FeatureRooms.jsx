import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import RoomCard from "../rooms/RoomCard";

const FeatureRooms = () => {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        // 1. Đổi API thành endpoint /feature-room vừa tạo
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API_URL}/api/v1/rooms/feature-room`);
        
        if (res.data.success) {
          // 2. Map dữ liệu đúng theo yêu cầu của RoomCard
          const formattedRooms = res.data.data.map((item) => ({
            id: item._id,
            
            // Hình ảnh từ hero
            image: item.hero?.image, 
            
            // Format giá tiền vào chỗ Heading (chữ nhỏ)
            heading: item.base_price 
              ? `${item.base_price.toLocaleString('vi-VN')} VNĐ / ĐÊM`
              : "LIÊN HỆ", 

            // Tên phòng
            title: item.title,
            
            // Subtitle từ hero làm mô tả
            description: item.hero?.subtitle || "Mô tả đang cập nhật...",
            slug: item.slug,
          }));

          setRooms(formattedRooms);
        }
      } catch (error) {
        console.error("Lỗi tải phòng nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  // Logic nhân đôi mảng nếu ít phòng để swiper chạy loop mượt hơn
  const displayRooms = rooms.length > 0 && rooms.length < 6 ? [...rooms, ...rooms] : rooms;

  return (
    <section className="w-full bg-white py-24 overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative">
        
        <div className="text-center mb-12">
          <p className="text-2xl tracking-[0.2em] uppercase italic font-medium text-neutral-500 font-playfair">
            DANH SÁCH PHÒNG NỔI BẬT
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-400">Đang tải dữ liệu...</div>
        ) : rooms.length > 0 ? (
          <>
            <div className="py-10">
              <Swiper
                modules={[Navigation]}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                allowTouchMove={false}
                simulateTouch={false}
                onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                loop={true}
                centeredSlides={true}
                speed={700}
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 1.6, spaceBetween: 24 },
                  768: { slidesPerView: 2.2, spaceBetween: 30 },
                  1024: { slidesPerView: 3, spaceBetween: 40 },
                }}
                className="overflow-visible!"
              >
                {displayRooms.map((room, index) => (
                  // Dùng index kết hợp id để tránh lỗi key khi nhân đôi mảng
                  <SwiperSlide key={`${room.id}-${index}`} className="h-auto!">
                    {({ isActive }) => (
                      <div
                        className={`transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] 
                        ${isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"}`}
                      >
                        <RoomCard data={room} isActive={isActive} />
                      </div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Nút điều hướng */}
            <div className="flex justify-center items-center gap-5 mt-8">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300"
              >
                <span className="text-2xl font-thin pb-1">{"<"}</span>
              </button>

              <span className="text-[11px] tracking-[0.3em] text-neutral-500 font-sans w-16 text-center">
                {(currentIndex % rooms.length) + 1} / {rooms.length}
              </span>

              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300"
              >
                <span className="text-2xl font-thin pb-1">{">"}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-neutral-200 rounded-lg bg-neutral-50">
            <p className="text-lg text-neutral-400 font-playfair italic">
              Chưa có phòng nổi bật
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureRooms;