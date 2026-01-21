import React, { useEffect, useState } from "react";
import ServiceCard from "../services/ServiceCard";
import axios from "axios";
import { Link } from "react-router-dom";

const FeatureServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        // Gọi API với tham số type=EXPERIENCE
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/full-service/feature-by-type?type=EXPERIENCE`);
        
        if (response.data.success) {
          setServices(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trải nghiệm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  if (loading) return <div className="py-24 text-center">Đang tải dịch vụ...</div>;

  return (
    <section className="w-full bg-white py-24 border-t border-neutral-100">
      <div className="w-full max-w-[1500px] mx-auto px-6 md:px-8">

        <div className="text-center mb-16">
          <h2 className="text-[35px] tracking-[0.25em] font-playfair font-medium italic uppercase text-neutral-700">
            Dịch vụ tận tâm
          </h2>
        </div>
        
        {/* Render danh sách dịch vụ từ API */}
        <div className="flex flex-col">
          {services.map((service) => (
            <ServiceCard 
              key={service._id} 
              data={{
                slug: service.slug, // Truyền slug để tạo Link
                title: service.title,
                // Lấy ảnh đầu tiên trong mảng gallery, nếu không có thì dùng ảnh placeholder
                image: service.gallery && service.gallery.length > 0 
                  ? service.gallery[0] 
                  : "https://via.placeholder.com/1200x800?text=No+Image"
              }} 
            />
          ))}
        </div>

        {/* Thông báo nếu chưa có dữ liệu */}
        {services.length === 0 && (
          <p className="text-center text-neutral-400 mb-10">Hiện chưa có dịch vụ nào được cập nhật.</p>
        )}

        {/* Nút Xem thêm - Điều hướng sang trang danh sách Trải nghiệm */}
        <div className="flex justify-center mt-20">
          <Link to="/trai-nghiem">
            <button className="bg-black text-white text-[11px] font-bold uppercase cursor-pointer tracking-[0.2em] px-10 py-4 hover:bg-neutral-800 transition-colors duration-300">
              Xem thêm dịch vụ
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeatureServices;