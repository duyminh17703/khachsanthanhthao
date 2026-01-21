import React from "react";

const OfferCard = ({ data }) => {
  return (
    <div className="group relative w-full h-[450px] overflow-hidden cursor-pointer">
      {/* 1. Background Image với hiệu ứng Zoom khi Hover */}
      <div className="w-full h-full overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-1500ms ease-out group-hover:scale-110"
        />
      </div>

      {/* 2. Lớp phủ Gradient đen mờ từ dưới lên (để chữ trắng dễ đọc) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

      {/* 3. Nội dung Text */}
      <div className="absolute bottom-8 left-8 right-8 text-white z-10 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
        <h3 className="text-[13px] font-bold tracking-[0.2em] uppercase mb-1 leading-relaxed">
          {data.title}
        </h3>
        <div className="w-10 h-px bg-white/60 mb-3 transition-all duration-500 group-hover:w-66 group-hover:bg-white"></div>
        
        <button className="text-[10px] tracking-[0.25em] cursor-pointer uppercase border-b border-transparent transition-all duration-300 pb-1">
          Chi tiết
        </button>
      </div>
    </div>
  );
};

export default OfferCard;