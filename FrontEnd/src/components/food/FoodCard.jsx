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
    <div className="relative w-full h-screen min-h-[600px] bg-stone-50 border-b border-stone-200 overflow-hidden select-none group">
      
      {/* ================= LAYER 1: NỘI DUNG VĂN BẢN ================= */}
      <div className="absolute inset-0 flex w-full h-full">
        
        {/* --- [LEFT] FULL DESCRIPTION (Hiện khi mở) --- */}
        <div className={`w-1/2 h-[800px] bg-white p-12 lg:p-20 flex flex-col justify-center transition-all duration-700 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
           <h4 className="font-playfair text-[15px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-8 border-l-2 border-stone-900 pl-3">
              Trải nghiệm thượng hạng
           </h4>
           
           <h3 className="font-playfair font-bold italic text-4xl text-stone-900 mb-8 leading-tight">
             "{data.title}"
           </h3>
           
           <div className="overflow-y-auto pr-6 mb-10 text-sm leading-8 font-light text-stone-600 max-h-[35vh] custom-scrollbar space-y-4">
              <p className="italic text-stone-500">
                {data.description}
              </p>
           </div>

           {/* --- THAY ĐỔI Ở ĐÂY: Nút Back thành View More --- */}
           <Link
              to ={detailLink}
              className="
                self-start group/btn flex items-center gap-3 
                text-[11px] font-bold tracking-[0.25em] uppercase text-stone-900 
                border-b border-stone-300 pb-1
                hover:text-stone-500 hover:border-stone-500 transition-all
              "
           >
              Xem chi tiết  
           </Link>
        </div>

        {/* --- [RIGHT] SUMMARY (Hiện khi đóng) --- */}
        <div className={`w-1/2 h-[700px] bg-stone-50 p-12 lg:p-20 flex flex-col justify-center pl-24 transition-all duration-700 ${!isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
           
           <h2 className="font-playfair text-4xl lg:text-6xl font-medium italic text-stone-900 mb-6 leading-tight">
              {data.title}
           </h2>
           
           <div className="w-full h-0.5 bg-stone-300 mb-8"></div>

           <p className="italic text-lg text-stone-500 mb-10 leading-relaxed max-w-md">
              {data.highlight}
           </p>
           
           <div className="mb-12">
              <span className="block text-[11px] tracking-[0.2em] uppercase text-stone-400 mb-2">Giá cả</span>
              <span className="font-playfair text-2xl italic text-stone-700">{data.price}</span>
           </div>

           <Link
              to={detailLink}
              className="
                relative overflow-hidden self-start px-8 py-4 bg-transparent border border-stone-900 
                text-[13px] font-bold tracking-[0.25em] uppercase text-stone-900 
                transition-all duration-500 hover:bg-stone-900 hover:text-white
              "
            >
              Xem thêm
           </Link>
        </div>

      </div>

      {/* ================= LAYER 2: MOVABLE IMAGE PANEL (Giữ nguyên) ================= */}
      <div 
        {...swipeHandlers}
        onMouseDown={swipeHandlers.onTouchStart}
        onMouseMove={swipeHandlers.onTouchMove}
        onMouseUp={swipeHandlers.onTouchEnd}
        onMouseLeave={swipeHandlers.onTouchEnd}
        
        className={`
            absolute top-0 bottom-0 w-1/2 z-20 shadow-[0_0_80px_rgba(0,0,0,0.2)] 
            cursor-grab active:cursor-grabbing touch-pan-y
            transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${isOpen ? "translate-x-full" : "translate-x-0"} 
        `}
      >
        <Swiper
          modules={[Pagination, EffectFade, Autoplay]}
          effect="fade"
          allowTouchMove={false}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          speed={1800}
          loop={true}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="h-full w-full pointer-events-none"
        >
          {data.images.map((img, index) => (
            <SwiperSlide key={index} className="h-full w-full bg-stone-200">
              <div className="w-full h-full relative">
                <img 
                    src={img} 
                    alt={data.title} 
                    draggable={false} 
                    className="w-full h-full object-cover select-none brightness-90"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/10"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <NavArrow direction="right" onClick={() => setIsOpen(true)} isHidden={isOpen} />
        <NavArrow direction="left" onClick={() => setIsOpen(false)} isHidden={!isOpen} />

      </div>
    </div>
  );
};

export default FoodCard;