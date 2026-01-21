import React from "react";
import { Link } from "react-router-dom";

const ServiceCard = ({ data }) => {
  const detailLink = `/trai-nghiem/${data.slug}`;

  return (
    <div className="w-full mb-20 last:mb-0 group">
      
      {/* --- HEADER SECTION: TEXT INFO --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 px-2">
        
        {/* Left: Title & Desc */}
        <div className="max-w-2xl">        
          {/* Title - Có Link */}
          <Link to={detailLink}>
            <h3 className="font-playfair italic font-light text-xl md:text-3xl tracking-[0.15em] uppercase text-neutral-900 mb-1 cursor-pointer hover:text-neutral-600 transition-colors">
              {data.title}
            </h3>
          </Link>
        </div>

        {/* Right: Details Link */}
        <div className="mt-6 md:mt-0">
          <Link 
            to={detailLink}
            className="text-[12px] font-bold tracking-[0.25em] uppercase border-b border-black pb-1 cursor-pointer hover:text-neutral-600 hover:border-neutral-400 transition-colors"
          >
            Chi tiết
          </Link>
        </div>
      </div>

      {/* --- IMAGE SECTION - Có Link --- */}
      <Link to={detailLink} className="block w-full h-[50vh] md:h-[75vh] overflow-hidden relative cursor-pointer">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-1500 ease-out group-hover:scale-105"
        />
        {/* Lớp phủ nhẹ khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
      </Link>

    </div>
  );
};

export default ServiceCard;