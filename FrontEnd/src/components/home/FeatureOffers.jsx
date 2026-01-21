import React, { useEffect, useState } from "react";
import OfferCard from "../offers/OfferCard";
import axios from "axios"; // Đảm bảo bạn đã cài axios
import { Link } from "react-router-dom";

const FeatureOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedOffers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/offers/featured`);
        if (response.data.success) {
          setOffers(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy ưu đãi nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedOffers();
  }, []);

  if (loading) return <div className="py-24 text-center">Đang tải ưu đãi...</div>;

  return (
    <section className="w-full bg-white py-24 border-t border-neutral-200">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12">
          <h2 className="text-[17px] tracking-[0.25em] font-bold uppercase text-neutral-600 mb-4 md:mb-0">
            các gói ưu đãi nổi bật
          </h2>
          
          <Link 
            to="/offers" 
            className="text-[13px] tracking-[0.2em] uppercase text-neutral-500 hover:text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 pb-1 transition-all duration-300"
          >
            Tất cả ưu đãi
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer) => (
            <Link key={offer._id} to={`/offers/${offer.slug}`} className="block">
              <OfferCard 
                data={{
                  title: offer.title,
                  image: offer.thumbnail,
                }} 
              />
            </Link>
          ))}
        </div>

        {offers.length === 0 && (
          <p className="text-center text-neutral-400">Hiện chưa có ưu đãi đặc biệt nào.</p>
        )}

      </div>
    </section>
  );
};

export default FeatureOffers;