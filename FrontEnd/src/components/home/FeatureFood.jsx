import React, { useEffect, useState } from "react";
import FoodCard from "../food/FoodCard.jsx";
import axios from "axios";

const FeatureFood = () => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchDining = async () => {
      try {
        // Gọi API lấy dịch vụ loại DINING
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/full-service/feature-by-type?type=DINING`);
        
        if (response.data.success) {
          setFoodList(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu ẩm thực:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDining();
  }, []);

  if (loading) return <div className="py-24 text-center">Đang tải thực đơn...</div>;

  return (
    <section className="w-full bg-white">
      <div className="flex flex-col">
        {foodList.map((item) => {
          
          // Xử lý logic ghép chuỗi Highlight: Availability - Time - Duration
          // Ví dụ: "Daily - 6:00 PM - 2 Hours"
          const metaInfo = [
            item.details?.availability,
            item.details?.time_of_day,
            item.details?.duration
          ].filter(Boolean).join(" • "); // Dùng dấu chấm tròn ngăn cách cho đẹp

          return (
            <FoodCard 
              key={item._id} 
              data={{
                slug: item.slug, // Truyền slug để gắn link
                title: item.title,
                // Truyền cả mảng gallery để slider hoạt động
                images: item.gallery && item.gallery.length > 0 ? item.gallery : ["https://via.placeholder.com/800x600?text=No+Image"], 
                description: item.description,
                highlight: metaInfo || "Trải nghiệm ẩm thực đặc sắc", // Fallback nếu thiếu data
                price: item.details?.price || "Liên hệ"
              }} 
            />
          );
        })}

        {foodList.length === 0 && (
          <div className="py-20 text-center text-neutral-400">
            Hiện chưa có thực đơn nổi bật nào.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureFood;