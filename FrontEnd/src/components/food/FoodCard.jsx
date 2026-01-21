import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Link } from "react-router-dom";

// --- CUSTOM HOOK: XỬ LÝ SWIPE (Giữ nguyên) ---
const useSwipeLogic = (onSwipeLeft, onSwipeRight) => {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndX.current = 0;
    touchStartX.current = e.type === 'touchstart' ? e.targetTouches[0].clientX : e.clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.type === 'touchmove' ? e.targetTouches[0].clientX : e.clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && onSwipeRight) onSwipeRight();
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// --- SUB-COMPONENT: NÚT ĐIỀU HƯỚNG TRÒN (Giữ nguyên) ---
const NavArrow = ({ direction, onClick, isHidden }) => {
  const isRight = direction === "right";
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        absolute top-1/2 -translate-y-1/2 z-30 
        w-10 h-10 rounded-full cursor-pointer
        bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
        flex items-center justify-center 
        text-white transition-all duration-500 ease-out
        hover:bg-white hover:text-stone-900 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]
        ${isRight ? "right-8" : "left-8"}
        ${isHidden ? "opacity-0 pointer-events-none scale-75" : "opacity-50 scale-100"}
      `}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        {isRight 
          ? <path d="M4 12H20M20 12L14 6M20 12L14 18" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M20 12H4M4 12L10 6M4 12L10 18" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </div>
  );
};

const FoodCard = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const detailLink = `/am-thuc/${data.slug}`;

  const swipeHandlers = useSwipeLogic(
    () => setIsOpen(false), // Vuốt trái -> Đóng
    () => setIsOpen(true)   // Vuốt phải -> Mở
  );

  return (
  <div className="relative w-full h-auto md:h-screen min-h-[600px] bg-stone-50 border-b border-stone-200 overflow-hidden select-none group flex flex-col md:flex-row">
    
    {/* ================= LAYER 1: NỘI DUNG VĂN BẢN ================= */}
    <div className="relative md:absolute inset-0 flex flex-col md:flex-row w-full h-full">
      
      {/* --- [LEFT] FULL DESCRIPTION --- */}
      <div className={`
        w-full md:w-1/2 h-auto md:h-full bg-white p-8 md:p-12 lg:p-20 flex flex-col justify-center 
        transition-all duration-700 
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 hidden md:flex'}
      `}>
         <h4 className="font-playfair text-[12px] md:text-[15px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-4 md:mb-8 border-l-2 border-stone-900 pl-3">
            Trải nghiệm thượng hạng
         </h4>
         
         <h3 className="font-playfair font-bold italic text-2xl md:text-4xl text-stone-900 mb-4 md:mb-8 leading-tight">
           "{data.title}"
         </h3>
         
         <div className="overflow-y-auto pr-6 mb-6 md:mb-10 text-sm leading-7 md:leading-8 font-light text-stone-600 max-h-[30vh] md:max-h-[35vh] space-y-4">
            <p className="italic text-stone-500">{data.description}</p>
         </div>

         <Link to={detailLink} className="self-start group/btn flex items-center gap-3 text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase text-stone-900 border-b border-stone-300 pb-1 hover:text-stone-500 hover:border-stone-500 transition-all">
            Xem chi tiết  
         </Link>
      </div>

      {/* --- [RIGHT] SUMMARY (Mặc định hiện trên mobile) --- */}
      <div className={`
        w-full md:w-1/2 h-auto md:h-full bg-stone-50 p-8 md:p-12 lg:p-20 flex flex-col justify-center 
        md:pl-24 transition-all duration-700 
        ${!isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 hidden md:flex'}
      `}>
         <h2 className="font-playfair text-3xl md:text-4xl lg:text-6xl font-medium italic text-stone-900 mb-4 md:mb-6 leading-tight">
            {data.title}
         </h2>
         
         <div className="w-16 md:w-full h-0.5 bg-stone-300 mb-6 md:mb-8"></div>

         <p className="italic text-base md:text-lg text-stone-500 mb-8 md:mb-10 leading-relaxed max-w-md">
            {data.highlight}
         </p>
         
         <div className="mb-8 md:mb-12">
            <span className="block text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-stone-400 mb-1 md:mb-2">Giá cả</span>
            <span className="font-playfair text-xl md:text-2xl italic text-stone-700">{data.price}</span>
         </div>

         <Link to={detailLink} className="relative overflow-hidden self-start px-6 md:px-8 py-3 md:py-4 bg-transparent border border-stone-900 text-[11px] md:text-[13px] font-bold tracking-[0.25em] uppercase text-stone-900 transition-all duration-500 hover:bg-stone-900 hover:text-white">
            Xem thêm
         </Link>
      </div>

    </div>

    {/* ================= LAYER 2: MOVABLE IMAGE PANEL (Ẩn trượt trên mobile) ================= */}
    <div 
      {...swipeHandlers}
      className={`
          relative md:absolute top-0 bottom-0 w-full md:w-1/2 h-[350px] md:h-full z-20 shadow-xl md:shadow-[0_0_80px_rgba(0,0,0,0.2)] 
          cursor-grab active:cursor-grabbing touch-pan-y
          transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "md:translate-x-full" : "md:translate-x-0"} 
      `}
    >
      <Swiper
        modules={[Pagination, EffectFade, Autoplay]}
        effect="fade"
        allowTouchMove={true} // Bật touch move cho mobile dễ dùng slider
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1800}
        loop={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        className="h-full w-full"
      >
        {data.images.map((img, index) => (
          <SwiperSlide key={index} className="h-full w-full bg-stone-200">
            <img src={img} alt={data.title} className="w-full h-full object-cover brightness-90" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Chỉ hiện nút điều hướng trên máy tính */}
      <div className="hidden md:block">
        <NavArrow direction="right" onClick={() => setIsOpen(true)} isHidden={isOpen} />
        <NavArrow direction="left" onClick={() => setIsOpen(false)} isHidden={!isOpen} />
      </div>
    </div>
  </div>
);};

export default FoodCard;