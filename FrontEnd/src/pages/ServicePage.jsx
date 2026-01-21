import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { 
    ArrowRight, 
    Sparkle, 
    ForkKnife, 
    Compass, 
    Plant, 
    Waves, 
    Confetti, 
    Coffee, 
    Wine,
    ChefHat,
    Leaf
} from '@phosphor-icons/react';

// Cấu hình nội dung & Ảnh nền Hero
export const PAGE_CONFIGS = {
  'EXPERIENCE': {
    title: 'TRẢI NGHIỆM ĐẲNG CẤP',
    subtitle: 'Wellness & Activities',
    description: 'Cùng người ấy tái tạo năng lượng với các liệu pháp Spa chuyên sâu, phòng Gym hiện đại và các hoạt động văn hóa giải trí độc đáo.',
    baseLink: '/experience',
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
    icon: <Sparkle size={32} />,
    categories: {
      'Wellness': { title: 'Sức Khỏe & Thư Giãn', icon: <Waves size={24}/>, subtitle: 'Liệu trình phục hồi thân - tâm - trí' },
      'Vitality': { title: 'Năng Lượng & Thể Thao', icon: <Plant size={24}/>, subtitle: 'Khơi dậy sức sống mỗi ngày' },
      'Festive':  { title: 'Lễ Hội & Văn Hóa',    icon: <Confetti size={24}/>, subtitle: 'Kết nối văn hóa bản địa' }
    }
  },
  'DISCOVER': {
    title: 'KHÁM PHÁ ĐÀ LẠT',
    subtitle: 'Local Tours & Nature',
    description: 'Đà Lạt không chỉ có hoa và tình yêu. Hãy cùng người ấy len lỏi vào những cánh rừng thông, những đồi chè cổ và những di sản kiến trúc Pháp vượt thời gian.',
    baseLink: '/discover',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1948&auto=format&fit=crop',
    icon: <Compass size={32} />,
    categories: {
      'Nature':   { title: 'Thiên Nhiên Hùng Vĩ', icon: <Leaf size={24}/>, subtitle: 'Hòa mình vào vẻ đẹp hoang sơ' },
      'Heritage': { title: 'Di Sản & Kiến Trúc', icon: <Compass size={24}/>, subtitle: 'Dấu ấn thời gian qua từng công trình' },
      'Trend':    { title: 'Điểm Đến Xu Hướng',  icon: <Sparkle size={24}/>, subtitle: 'Những toạ độ check-in mới nhất' }
    }
  },
  'DINING': {
    title: 'ẨM THỰC TINH HOA',
    subtitle: 'Restaurants & Bars',
    description: 'Con đường nhanh nhất dẫn đến trái tim đàn ông là đường dạ dày. Hãy cùng người ấy trải nghiệm hành trình vị giác đa tầng, từ bữa sáng tinh khôi bên hồ, trà chiều lãng mạn đến bữa tối Fine Dining dưới ánh nến lung linh.',
    baseLink: '/dining',
    heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
    icon: <ForkKnife size={32} />,
    categories: {
      'Breakfast': { title: 'Thực Đơn Bữa Sáng',   icon: <Coffee size={24}/>, subtitle: 'Khởi đầu ngày mới đầy năng lượng' },
      'Lunch':     { title: 'Bữa Trưa Á - Âu',     icon: <ChefHat size={24}/>, subtitle: 'Sự giao thoa ẩm thực độc đáo' },
      'Afternoon': { title: 'Trà Chiều Sunset',    icon: <Coffee size={24}/>, subtitle: 'Thư giãn bên set trà và bánh ngọt' },
      'Dinner':    { title: 'Bữa Tối Lãng Mạn',    icon: <Wine size={24}/>,   subtitle: 'Trải nghiệm ẩm thực đỉnh cao' }
    }
  }
};

const ServiceListingPage = ({ serviceType }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = PAGE_CONFIGS[serviceType];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/v1/full-service/list-by-type', {
            params: { type: serviceType }
        });
        setServices(response.data.data); 
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [serviceType]);

  // Hàm cuộn đến section (Smooth scroll)
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderSections = () => {
    return Object.keys(config.categories).map(catKey => {
       const catInfo = config.categories[catKey];
       const items = services.filter(s => s.category === catKey);

       // Chỉ render nếu có items (hoặc muốn hiện placeholder thì bỏ check này)
       if (items.length === 0) return null;

       return (
          <div id={catKey} className="mb-24 scroll-mt-32 border-b border-neutral-100 pb-16 last:border-0" key={catKey}>
            {/* Category Header */}
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-amber-600 mb-3">{catInfo.icon}</span>
                <h2 className="text-3xl font-serif text-neutral-900 mb-2">{catInfo.title}</h2>
                <p className="text-neutral-500 font-light italic text-sm">{catInfo.subtitle}</p>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {items.map((item) => (
                  <div key={item._id} className="group cursor-pointer">
                    {/* Image Card */}
                    <div className="overflow-hidden mb-6 relative aspect-[4/5] bg-neutral-100">
                      <Link to={`${config.baseLink}/${item.slug}`}>
                        <img 
                          src={item.gallery?.[0] || 'https://via.placeholder.com/400x500'} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        />
                      </Link>
                      
                      {/* Overlay Price on Hover */}
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/90 backdrop-blur-sm border-t border-neutral-200">
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Giá từ</span>
                              <span className="font-serif italic text-lg text-neutral-900">{item.details?.price || "Liên hệ"}</span>
                          </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-playfair font-medium text-neutral-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                        <Link to={`${config.baseLink}/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p className="text-sm text-neutral-500 font-light leading-relaxed line-clamp-2 mb-4">
                        {item.description}
                      </p>
                      <Link 
                        to={`${config.baseLink}/${item.slug}`} 
                        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black border-b border-transparent hover:border-black pb-1 transition-all"
                      >
                        Chi tiết <ArrowRight size={14}/>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
       );
    });
  };

  if (!config) return <div>Trang không tồn tại</div>;

  return (
    <MainLayout>
      {/* 1. HERO SECTION (DARK MODE) */}
      <div className="relative h-[60vh] md:h-[70vh] bg-neutral-900 flex items-center justify-center text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img 
                src={config.heroImage} 
                alt={config.title} 
                className="w-full h-full object-cover opacity-60 animate-scale-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 max-w-4xl mt-10">
            <div className="flex justify-center mb-4 text-amber-400 opacity-80 animate-fadeIn">
                {config.icon}
            </div>
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/70 mb-4 animate-fadeIn">
                {config.subtitle}
            </p>
            <h1 className="text-4xl md:text-6xl font-playfair italic font-medium text-white mb-6 leading-tight animate-fadeIn">
                {config.title}
            </h1>
            <div className="w-20 h-[1px] bg-white/50 mx-auto mb-8"></div>
        </div>
      </div>

      {/* 2. DESCRIPTION & NAVIGATION */}
      <div className="bg-white">
        <div className="container mx-auto px-6 -mt-16 relative z-20">
            <div className="bg-white p-8 md:p-16 shadow-2xl max-w-4xl mx-auto text-center border-t-4 border-amber-700">
                <p className="text-lg md:text-xl font-serif italic text-neutral-800 leading-relaxed mb-10">
                    "{config.description}"
                </p>

                {/* Quick Navigation Pills */}
                <div className="flex flex-wrap justify-center gap-4">
                    {Object.keys(config.categories).map(catKey => (
                        <button 
                            key={catKey}
                            onClick={() => scrollToSection(catKey)}
                            className="px-6 py-3 bg-stone-50 hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border border-neutral-100"
                        >
                            {config.categories[catKey].title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="bg-white min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
           {loading ? (
                <div className="text-center py-20 tracking-[0.2em] text-neutral-400 text-xs font-bold uppercase animate-pulse">
                    Đang tải dữ liệu...
                </div>
           ) : (
                renderSections()
           )}
        </div>
      </div>

      {/* 4. FOOTER FEATURES (HIGHLIGHTS) */}
      <div className="bg-stone-50 py-24 border-t border-neutral-200">
        <div className="container mx-auto px-6 max-w-6xl text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-amber-700 mb-6 shadow-sm">
                        <Sparkle size={28} weight="fill"/>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-neutral-900">Tiêu chuẩn 5 sao</h4>
                    <p className="text-sm text-neutral-500 font-light px-4">
                        Dịch vụ được vận hành bởi đội ngũ chuyên nghiệp, tận tâm theo tiêu chuẩn quốc tế.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-amber-700 mb-6 shadow-sm">
                        <Leaf size={28} weight="fill"/>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-neutral-900">Nguyên liệu bản địa</h4>
                    <p className="text-sm text-neutral-500 font-light px-4">
                        Ưu tiên sử dụng nông sản sạch từ các nông trại Đà Lạt để đảm bảo sự tươi ngon.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-amber-700 mb-6 shadow-sm">
                        <Compass size={28} weight="fill"/>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-neutral-900">Trải nghiệm độc bản</h4>
                    <p className="text-sm text-neutral-500 font-light px-4">
                        Mỗi dịch vụ đều được thiết kế riêng để mang lại kỷ niệm khó quên cho du khách.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceListingPage;