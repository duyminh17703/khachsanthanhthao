import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import RoomList from '../components/rooms/RoomList';
import axios from 'axios';
import { 
    WifiHigh, 
    Television, 
    VideoCamera, 
    Newspaper, 
    Headset, 
    Clock, 
    CreditCard, 
    Lifebuoy, 
    Hourglass, 
    Bed, 
    SlidersHorizontal 
} from '@phosphor-icons/react';

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'STANDARD', 'LUXURY'

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/rooms/list-rooms`);
        if (response.data.success) {
          setRooms(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // --- 1. TÁCH DỮ LIỆU THÀNH 2 NHÓM ---
  const standardRooms = rooms?.filter(r => r.typeRoom === 'STANDARD') || [];
  const luxuryRooms = rooms?.filter(r => r.typeRoom === 'LUXURY') || [];

  const countStandard = standardRooms.length;
  const countLuxury = luxuryRooms.length;
  const countAll = rooms?.length || 0;

  // --- 2. COMPONENT CON: NÚT BẤM FILTER ---
  const FilterButton = ({ label, count, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border rounded-full
        ${isActive 
          ? 'bg-black text-white border-black' 
          : 'bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black'
        }
      `}
    >
      {label} <span className="ml-1 opacity-70">({count})</span>
    </button>
  );

  // --- 3. COMPONENT CON: SECTION HIỂN THỊ TỪNG LOẠI PHÒNG ---
  const RoomCategorySection = ({ title, count, description, data }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-24 border-b border-neutral-100 pb-16 last:border-0 last:mb-0 last:pb-0 animate-fadeIn">
        {/* Header của Section */}
        <div className="mb-12 text-center md:text-left">
           <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
               <span className="w-12 h-px bg-amber-700"></span>
               <h2 className="text-2xl md:text-3xl font-serif font-medium uppercase tracking-widest text-neutral-900">
                  {title}
               </h2>
           </div>
           <p className="text-neutral-500 font-light leading-relaxed max-w-4xl text-[15px] md:text-base italic">
              "{description}"
           </p>
        </div>
        {/* Danh sách phòng */}
        <RoomList rooms={data} />
      </div>
    );
  };

  // --- 4. DỮ LIỆU TIỆN ÍCH (AMENITIES) - Dùng Phosphor Icons ---
  const amenities = [
    { label: "Wifi Tốc độ cao", icon: <WifiHigh size={32} weight="light" /> },
    { label: "Smart TV 55inch", icon: <Television size={32} weight="light" /> },
    { label: "Camera an ninh",  icon: <VideoCamera size={32} weight="light" /> },
    { label: "Báo mới mỗi ngày", icon: <Newspaper size={32} weight="light" /> },
    { label: "Hỗ trợ 24/7",     icon: <Headset size={32} weight="light" /> }
  ];

  // --- 5. DỮ LIỆU CHÍNH SÁCH (POLICIES) - Dùng Phosphor Icons ---
  const policies = [
    {
      title: "THỜI GIAN NHẬN & TRẢ PHÒNG",
      content: "Giờ nhận phòng: 12:00 PM | Giờ trả phòng: 12:00 PM",
      icon: <Clock size={24} className="text-amber-700" />
    },
    {
      title: "NHẬN SỚM & TRẢ MUỘN",
      content: "Để đảm bảo chất lượng phòng nghỉ luôn hoàn hảo, Quý khách vui lòng nhận phòng từ 12:00 PM. Trả phòng muộn sau 12:00 PM sẽ tính phí tương đương một đêm nghỉ.",
      icon: <Hourglass size={24} className="text-amber-700" />
    },
    {
      title: "PHƯƠNG THỨC THANH TOÁN",
      content: "Thanh toán tại quầy Lễ tân khi làm thủ tục trả phòng. Chấp nhận Tiền mặt, Chuyển khoản và các loại thẻ tín dụng quốc tế (Visa, Master, JCB...).",
      icon: <CreditCard size={24} className="text-amber-700" />
    },
    {
      title: "HỖ TRỢ & XỬ LÝ SỰ CỐ",
      content: "Đội ngũ Chăm sóc Khách hàng luôn sẵn sàng phục vụ 24/7. Hotline: 0942.819.936.",
      icon: <Lifebuoy size={24} className="text-amber-700" />
    }
  ];

  return (
    <MainLayout>
      {/* 1. HERO BANNER CINEMATIC */}
      <div className="relative h-[60vh] md:h-[70vh] bg-neutral-900 flex items-center justify-center text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop" 
                alt="Room Hero" 
                className="w-full h-full object-cover opacity-60 animate-scale-slow"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 max-w-4xl mt-10">
            <div className="flex justify-center mb-6 text-amber-400 opacity-80 animate-fadeIn">
                <Bed size={40} weight="thin" />
            </div>
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/70 mb-4 animate-fadeIn">
                Khách sạn Thanh Thảo
            </p>
            <h1 className="text-4xl md:text-6xl font-playfair italic font-medium text-white mb-6 leading-tight animate-fadeIn">
                Không gian nghỉ dưỡng
            </h1>
            <div className="w-20 h-px bg-white/50 mx-auto mb-8"></div>
        </div>
      </div>

      {/* 2. DESCRIPTION & FILTER */}
      <div className="bg-white">
          <div className="container mx-auto px-6 -mt-16 relative z-20">
              <div className="bg-white p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-5xl mx-auto">
                  {/* Mô tả */}
                  <p className="text-center text-lg md:text-xl italic text-neutral-800 leading-relaxed mb-12 font-serif max-w-3xl mx-auto">
                    "Trải nghiệm sự yên bình tuyệt đối trong các căn phòng được thiết kế tinh tế, 
                    kết hợp giữa nét quyến rũ cổ điển và tiện nghi hiện đại. 
                    Nơi mỗi giấc ngủ là một hành trình tái tạo năng lượng."
                  </p>

                  {/* Filter Bar */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-10 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4 md:mb-0 md:mr-4">
                          <SlidersHorizontal size={18} /> Bộ lọc:
                      </div>
                      <FilterButton 
                        label="Tất cả" 
                        count={countAll} 
                        isActive={filterType === 'ALL'} 
                        onClick={() => setFilterType('ALL')}
                      />
                      <FilterButton 
                        label="Tiêu chuẩn" 
                        count={countStandard} 
                        isActive={filterType === 'STANDARD'} 
                        onClick={() => setFilterType('STANDARD')}
                      />
                      <FilterButton 
                        label="Hạng sang" 
                        count={countLuxury} 
                        isActive={filterType === 'LUXURY'} 
                        onClick={() => setFilterType('LUXURY')}
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* 3. MAIN ROOM LIST */}
      <div className="bg-white min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
            {loading ? (
              <div className="text-center py-20 text-neutral-400 text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
                  Đang tải danh sách phòng...
              </div>
            ) : (
              <div>
                {(filterType === 'ALL' || filterType === 'STANDARD') && (
                  <RoomCategorySection 
                    title="Phòng Tiêu Chuẩn" 
                    count={countStandard}
                    description="Lý tưởng cho các cặp đôi hoặc gia đình nhỏ. Tận hưởng không gian ấm cúng với đầy đủ tiện nghi, nơi bạn tìm thấy sự cân bằng hoàn hảo giữa ngân sách và trải nghiệm."
                    data={standardRooms}
                  />
                )}

                {(filterType === 'ALL' || filterType === 'LUXURY') && (
                  <RoomCategorySection 
                    title="Phòng Luxury" 
                    count={countLuxury}
                    description="Đẳng cấp nghỉ dưỡng thượng lưu với không gian rộng mở, tầm nhìn tuyệt đẹp và nội thất tinh xảo. Sự lựa chọn hoàn hảo để ghi dấu những kỷ niệm đặc biệt."
                    data={luxuryRooms}
                  />
                )}
                
                {filterType !== 'ALL' && ((filterType === 'STANDARD' && countStandard === 0) || (filterType === 'LUXURY' && countLuxury === 0)) && (
                   <div className="text-center text-neutral-400 italic py-10">Không tìm thấy phòng phù hợp.</div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* 4. AMENITIES HIGHLIGHTS */}
      <div className="bg-stone-50 py-24 border-t border-neutral-200">
         <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
                <h3 className="font-playfair text-2xl italic text-neutral-900 mb-2">Tiện nghi vượt trội</h3>
                <div className="w-10 h-px bg-neutral-300 mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
               {amenities.map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                     <div className="w-16 h-16 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 mb-6 shadow-sm transition-all duration-500 group-hover:bg-black group-hover:text-white group-hover:shadow-lg">
                        {item.icon}
                     </div>
                     <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 group-hover:text-black transition-colors">
                        {item.label}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 5. HOTEL POLICIES */}
      <div className="bg-white py-24">
         <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-12 md:gap-24">
               
               {/* Header Cột Trái */}
               <div className="w-full md:w-1/3">
                  <div className="sticky top-32">
                      <h3 className="text-3xl font-playfair italic text-neutral-900 mb-4 leading-tight">
                         Chính sách <br/> & Quy định
                      </h3>
                      <p className="text-sm text-neutral-500 font-light leading-relaxed">
                          Chúng tôi cam kết mang đến sự minh bạch và thuận tiện nhất cho kỳ nghỉ của bạn.
                      </p>
                  </div>
               </div>

               {/* Nội dung Cột Phải */}
               <div className="w-full md:w-2/3">
                  <div className="divide-y divide-neutral-100">
                     {policies.map((item, index) => (
                        <div key={index} className="flex gap-6 py-8 first:pt-0 last:pb-0 hover:bg-neutral-50/50 transition-colors px-4 rounded-lg -mx-4">
                           <div className="shrink-0 mt-1">
                              {item.icon}
                           </div>
                           <div>
                              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-900 mb-3">
                                 {item.title}
                              </h4>
                              <p className="font-serif text-[15px] leading-relaxed text-neutral-600 font-light text-justify">
                                 {item.content}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </div>
    </MainLayout>
  );
};

export default RoomPage;