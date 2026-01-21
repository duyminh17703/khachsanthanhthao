import React, { useEffect, useState } from "react";
import DiscoverCard from "../discover/DiscoverCard.jsx";
import axios from "axios";
import { Link } from "react-router-dom";

const FeaturedDiscover = () => {
  const [discovers, setDiscovers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        // Gọi API với tham số type=DISCOVER
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/full-service/feature-by-type?type=DISCOVER`);
        if (response.data.success) {
          setDiscovers(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu khám phá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveries();
  }, []);

  if (loading) return <div className="py-24 text-center">Đang tải trải nghiệm...</div>;

  return (
    <section className="w-full bg-white py-24 border-t border-neutral-200">
      <div className="w-full max-w-[1500px] mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[25px] tracking-[0.25em] font-playfair font-medium italic uppercase text-neutral-700">
            Khám phá Đà Lạt
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {discovers.map((item) => (
            <Link key={item._id} to={`/discover/${item.slug}`} className="block h-full">
              <DiscoverCard 
                data={{
                  // Map dữ liệu từ MongoDB sang Props của Card
                  image: item.gallery && item.gallery.length > 0 ? item.gallery[0] : "",
                  title: item.title,
                  duration: item.details?.duration || "N/A",
                  description: item.description,
                  price: item.details?.price || "Liên hệ",
                  unit: ""
                }} 
              />
            </Link>
          ))}
        </div>

        {/* Thông báo nếu không có dữ liệu */}
        {discovers.length === 0 && (
          <p className="text-center text-neutral-400">Hiện chưa có hoạt động nổi bật nào.</p>
        )}

        {/* Footer: Button Centered */}
        <div className="flex justify-center mt-16">
          <Link to="/discover">
            <button className="bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] px-10 py-4 hover:bg-neutral-800 transition-colors cursor-pointer duration-300">
              Khám phá thêm
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedDiscover;