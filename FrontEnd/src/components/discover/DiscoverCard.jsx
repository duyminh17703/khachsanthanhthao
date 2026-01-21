import React from "react";

const DiscoverCard = ({ data }) => {
  return (
    <div className="group cursor-pointer flex flex-col gap-4 h-full">
      {/* 1. Image Container (Zoom Effect) */}
      <div className="overflow-hidden w-full aspect-[4/5] relative">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
        />
      </div>

      {/* 2. Content */}
      <div className="flex flex-col flex-1 gap-2 mt-2">
        {/* Title: Serif font for elegance */}
        <h3 className="font-playfair italic text-2xl text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300">
          {data.title}
        </h3>

        {/* Duration with Icon */}
        <div className="flex items-center gap-2 text-[12px] text-neutral-500 uppercase tracking-wider font-medium">
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
          </svg>
          {data.duration}
        </div>

        {/* Description: Clamp 3 lines */}
        <p className="text-[14px] text-neutral-600 leading-relaxed line-clamp-3 font-light">
          {data.description}
        </p>

        {/* Price */}
        <div className="text-[20px] text-neutral-900 font-playfair font-medium italic mt-auto pt-5">
          {data.price}
        </div>
      </div>
    </div>
  );
};

export default DiscoverCard;