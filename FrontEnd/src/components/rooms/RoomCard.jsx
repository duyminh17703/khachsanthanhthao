import React from "react";
import { Link } from "react-router-dom"; // 1. Import Link

const RoomCard = ({ data, isActive }) => {
  // 2. Lấy thêm slug từ data
  const { image, heading, title, description, slug } = data;

  const displayDescription =
    description.length > 85 
      ? description.slice(0, 85) + "..." 
      : description;

  return (
    <div
      className={`
        relative w-full md:w-[350px] transition-all duration-800ms ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isActive ? "scale-100 opacity-100 z-10" : "scale-95 opacity-70 grayscale-[25%] z-0"}
      `}
    >
      <div
        className={`
          w-full bg-white overflow-hidden transition-all duration-500
          rounded-2xl
          border border-stone-100
          ${isActive ? "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]" : "shadow-lg"}
        `}
      >
        {/* Ảnh - Cũng bọc Link để click vào ảnh là chuyển trang luôn (UX tốt hơn) */}
        <Link to={`/rooms/${slug}`} className="block overflow-hidden relative h-[260px] cursor-pointer">
          <img
            src={image}
            alt={title}
            className={`
              w-full h-full object-cover transition-transform duration-1500ms ease-out
              ${isActive ? "scale-100" : "scale-105"}
            `}
          />
        </Link>

        <div className="px-6 py-8 text-center flex flex-col items-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-stone-400 mb-3 font-medium">
            {heading}
          </p>

          <h3 className="font-semibold text-xl italic tracking-[0.05em] text-stone-800 uppercase mb-4 min-h-14 flex items-center justify-center leading-tight">
            <Link to={`/room/${slug}`} className=" font-playfair hover:text-stone-600 transition-colors">
              {title}
            </Link>
          </h3>

          <div
            className={`
              h-px bg-stone-300 transition-all duration-700
              ${isActive ? "w-16 mb-5 opacity-100" : "w-0 mb-0 opacity-0"}
            `}
          />

          <div
            className={`
              overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
              ${isActive ? "max-h-[200px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"}
            `}
          >

            <p className="text-[13px] text-stone-500 leading-7 mb-7 font-light">
              {displayDescription}
            </p>

            {/* 3. Thay button bằng Link */}
            <Link 
              to={`/rooms/${slug}`} 
              className="
                group
                inline-block
                relative
                overflow-hidden
                rounded-full 
                border border-stone-800 
                bg-stone-900 
                text-white 
                px-9 py-3 
                text-[10px] 
                tracking-[0.25em] 
                uppercase 
                font-medium
                cursor-pointer
                transition-all duration-300
                hover:bg-white hover:text-stone-900 hover:border-stone-900 hover:shadow-md
              "
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;