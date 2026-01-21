import React from 'react';
// Import các module cần thiết của Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './RoomListItem.css';

const RoomListItem = ({ room }) => {
  
  // Logic format tiền tệ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 border-b border-neutral-200 py-12 last:border-0 group">
      
      {/* --- CỘT TRÁI: ẢNH SLIDER (45%) --- */}
      <div className="w-full lg:w-[45%] relative h-[300px] lg:h-[340px]">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ 
            type: 'fraction', // Hiển thị dạng số: 1 / 4
          }}
          // Thêm class 'luxury-swiper' để làm mốc style CSS
          className="h-full w-full luxury-swiper"
        >
          {room.gallery?.map((img, index) => (
            <SwiperSlide key={index}>
              <img 
                src={img} 
                alt={room.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </SwiperSlide>
          ))}
          
        </Swiper>
      </div>

      {/* --- CỘT PHẢI: THÔNG TIN (55%) --- */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between md:ml-14">
        
        {/* 1. HEADER: TÊN PHÒNG + MŨI TÊN */}
        <div className="mb-6">
          <h3 className="font-playfair font-bold text-sm md:text-xl text-neutral-900 uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
            <a href={`/danh-sach-phong/${room.slug}`}>{room.title}</a>
            {/* Icon Mũi tên mảnh */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </h3>
        </div>

        {/* 2. BODY: DANH SÁCH THÔNG SỐ (Dạng dọc giống ảnh mẫu) */}
        <div className="flex flex-col gap-4 mb-8">
           
           {/* -- Giường (Nối chuỗi bằng dấu phẩy) -- */}
           <div className="flex items-start gap-4 text-neutral-600 text-[10px] md:text-[12px] font-light leading-relaxed">
              {/* Icon Giường */}
              <div className="mt-0.5 min-w-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <span>
                {/* Logic: Nếu có mảng beds, nối lại bằng dấu phẩy. Nếu không có thì hiện N/A */}
                {room.details?.beds?.length > 0 
                  ? room.details.beds.join(', ') 
                  : "Bed configuration N/A"}
              </span>
           </div>

           {/* -- Phòng t -- */}
           <div className="flex items-start gap-4 text-neutral-600 text-[10px] md:text-[12px] font-light">
              {/* Icon Thước kẻ/Vuông */}
              <div className="mt-0.5 min-w-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l.716-2.507a2.25 2.25 0 012.16-1.631h13.748a2.25 2.25 0 012.16 1.631L21.75 12M2.25 12v6.75a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V12M12 2.25v4.5m0 0l-1.5-1.5m1.5 1.5l1.5-1.5" />
                </svg>
              </div>
              <span>{room.details?.bathroom?.[0] || "Basic"}</span>
           </div>

           {/* -- Số người -- */}
           <div className="flex items-start gap-4 text-neutral-600 text-[10px] md:text-[12px] font-light">
              {/* Icon Người */}
              <div className="mt-0.5 min-w-5">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                 </svg>
              </div>
              <span>{room.details?.occupancy?.[0] || "Occupancy N/A"}</span>
           </div>
        </div>

        {/* 3. FOOTER: GIÁ VÀ NÚT BẤM (Đã tối ưu đẹp hơn) */}
       {/* --- SỬA LOGIC CSS Ở ĐÂY --- */}
        <div className="flex items-center justify-center md:items-end md:justify-end border-t border-neutral-100 pt-6 mt-auto">
          
          {/* Giá tiền */}
          {/* Thêm items-center để các dòng chữ căn giữa với nhau trên mobile */}
          <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                Giá chỉ từ
              </span>
              <div className="flex items-baseline gap-1">
                {/* Chỉnh lại size chữ một chút cho cân đối */}
                <span className="text-lg md:text-xl font-serif font-light text-neutral-900">
                  {formatPrice(room.base_price)} /đêm
                </span>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomListItem;