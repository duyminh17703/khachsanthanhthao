import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useCart } from '../context/CartContext';
import { showSuccess, showError } from '../utils/toast';

// IMPORT PHOSPHOR ICONS
import { 
  Bed, 
  Users, 
  House, 
  Bathtub, 
  Binoculars, 
  CalendarBlank, 
  ShoppingCartSimple, 
  CreditCard, 
  LockKey, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  CaretDown,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';

// Hàm định dạng ngày: dd/mm/yyyy
const formatDateVN = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// COMPONENT: BỘ CHỌN NGÀY (CALENDAR)
const CalendarSelector = ({ onClose, onDateSelect, initialStartDate, initialEndDate, bookedRanges = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // [HÀM MỚI] Kiểm tra một ngày có nằm trong khoảng đã đặt không
  const isDateDisabled = (dateToCheck) => {
      // 1. Không cho chọn quá khứ
      if (dateToCheck < today) return true;

      // 2. Kiểm tra trùng lịch đặt
      // Logic: Ngày bị cấm là ngày: date >= checkIn VÀ date < checkOut
      // (Ta dùng < checkOut vì khách cũ trả phòng trưa 12h, khách mới có thể check-in chiều 14h cùng ngày đó)
      // Nếu bạn muốn cấm tuyệt đối cả ngày trả phòng thì dùng <=
      return bookedRanges.some(range => {
          const rangeStart = new Date(range.startDate);
          const rangeEnd = new Date(range.endDate);
          rangeStart.setHours(0,0,0,0);
          rangeEnd.setHours(0,0,0,0);
          
          return dateToCheck >= rangeStart && dateToCheck < rangeEnd; 
      });
  };

  const handleDayClick = (day) => {
    // [FIX] Nếu ngày bị disable thì không làm gì cả
    if (isDateDisabled(day)) return; 

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
        // [LOGIC MỚI] Nếu chọn ngày kết thúc mà ở giữa có ngày bị cấm thì không cho chọn
        // Ví dụ: Chọn ngày 1, ngày 3 bị cấm. Nếu click ngày 5 => Không hợp lệ.
        const hasBlockedInBetween = bookedRanges.some(range => {
            const rangeStart = new Date(range.startDate);
            const rangeEnd = new Date(range.endDate);
            return (day > rangeStart && startDate < rangeEnd);
        });

        if (hasBlockedInBetween) {
            showError("Khoảng thời gian bạn chọn có ngày đã hết phòng!");
            return;
        }

      if (day > startDate) {
        setEndDate(day);
      } else {
        setStartDate(day);
        setEndDate(null);
      }
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleDone = (e) => {
    e.preventDefault(); 
    if (startDate && endDate) {
       onDateSelect(startDate, endDate);
       onClose();
    } else {
       showError("Vui lòng chọn ngày nhận và trả phòng.");
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay();
    const monthName = monthDate.toLocaleString('default', { month: 'long' });

    let days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`empty-${i}`} />);
    
    for (let i = 1; i <= daysInMonth; i++) {
       const date = new Date(year, month, i);
       
       // [SỬA] Gọi hàm kiểm tra
       const isDisabled = isDateDisabled(date);
       
       const isStart = startDate && date.getTime() === startDate.getTime();
       const isEnd = endDate && date.getTime() === endDate.getTime();
       const isInRange = startDate && endDate && date > startDate && date < endDate;
       const isSelectedOrRange = isStart || isEnd || isInRange;

       days.push(
         <div 
           key={i} 
           onClick={() => handleDayClick(date)}
           className={`
             h-10 w-10 flex items-center justify-center text-xs font-medium rounded-full transition-colors relative
             ${isDisabled 
                ? 'text-neutral-300 bg-neutral-100 cursor-not-allowed line-through decoration-neutral-300' // Style cho ngày đã bị đặt
                : 'text-neutral-600 cursor-pointer hover:bg-stone-100'
             }
             ${isSelectedOrRange ? 'bg-black! text-white! hover:bg-neutral-800!' : ''}
           `}
         >
            {i}
         </div>
       );
    }
    
    return (
      <div className="flex-1 min-w-[280px]">
         <div className="text-center mb-6 font-serif italic text-lg text-neutral-800">
            {monthName} {year}
         </div>
         <div className="grid grid-cols-7 mb-4 text-[10px] font-bold tracking-widest text-neutral-400 text-center">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center">
            {days}
         </div>
      </div>
    );
  };

  const nextMonthDate = new Date(currentDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  return (
    <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl p-8 z-60 w-full md:w-[700px] border border-neutral-100 animate-fadeIn text-left">
      <div className="flex justify-between items-center mb-4">
         <button type="button" onClick={() => changeMonth(-1)} className="text-neutral-400 hover:text-black transition-colors">
            <CaretLeft size={24} weight="light" />
         </button>
         <button type="button" onClick={() => changeMonth(1)} className="text-neutral-400 hover:text-black transition-colors">
            <CaretRight size={24} weight="light" />
         </button>
      </div>

      <div className="flex gap-12 overflow-x-auto pb-4">
         {renderMonth(currentDate)}
         <div className="hidden md:block border-l border-neutral-100 pl-12">
            {renderMonth(nextMonthDate)}
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-neutral-100 mt-4 gap-4">
         <div className="flex items-center gap-4">
             {(startDate || endDate) && (
               <button type="button" onClick={clearDates} className="text-[10px] tracking-[0.15em] uppercase text-red-500 hover:text-red-700 flex items-center gap-1">
                 <X size={12} weight="bold" /> Xoá
               </button>
             )}
         </div>

         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-neutral-400 italic font-serif">
               {startDate ? formatDateVN(startDate) : "ngày đến"} - {endDate ? formatDateVN(endDate) : "ngày đi"}
            </span>
            <button 
               onClick={handleDone}
               className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3 hover:bg-neutral-800 transition-colors"
            >
               Xác nhận
            </button>
         </div>
      </div>
    </div>
  );
};

// --- TRANG CHÍNH: ROOM DETAILS ---
const RoomDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showBooking, setShowBooking] = useState(false);
  
  const [activePopup, setActivePopup] = useState(null); 
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/rooms/${slug}`);
        if (response.data.success) {
          const data = response.data.data; 
          setRoom(data);
          fetchAvailability(data._id);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [slug]);
  
  const fetchAvailability = async (roomId) => {
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.get(`${API_URL}/api/v1/rooms/availability/${roomId}`);
          if(res.data.success) {
              setBookedRanges(res.data.data);
          }
      } catch (error) {
          console.error("Lỗi lấy lịch trống:", error);
      }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleOpenBooking = () => setShowBooking(true);

  const handleCloseBooking = () => {
    setShowBooking(false);
    setActivePopup(null);
  };

  const handleDateSelect = (start, end) => {
    setCheckInDate(start);
    setCheckOutDate(end);
  };

   const handleAddToCart = async (e) => {
      e.preventDefault();
      if(!checkInDate || !checkOutDate) {
         showError("Vui lòng chọn ngày nhận và trả phòng!");
         return;
      }

    await addToCart({
        type: 'ROOM',
        itemId: room._id, 
        checkIn: checkInDate,
        checkOut: checkOutDate
    });
    setShowBooking(false);
    setIsCartOpen(false);
    showSuccess("Đã thêm vào giỏ hàng!");
  };

   const handleBookNow = (e) => {
    e.preventDefault();
    if(!checkInDate || !checkOutDate) {
        showError("Vui lòng chọn ngày nhận và trả phòng!");
        return;
    }

    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const totalPrice = nights * room.base_price;

    const directItem = {
        type: 'ROOM',
        itemId: room._id, 
        title: room.title,
        image: room.hero?.image,
        price: room.base_price,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nights,
        totalPrice: totalPrice,
        quantity: 1
    };

    setShowBooking(false);
    navigate('/checkout', { state: { directBooking: directItem } });
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-xs font-bold tracking-widest uppercase animate-pulse">Đang tải dữ liệu...</div>;
  if (!room) return <div className="h-screen flex items-center justify-center font-serif">Không tìm thấy phòng.</div>;

    const AmenityItem = ({ group, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-neutral-200">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between py-6 group cursor-pointer"
        >
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-neutral-900 group-hover:text-neutral-600 transition-colors text-left">
                {group.group_name}
            </h4>
            <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors">
                {isOpen ? <Minus size={20} weight="light" /> : <Plus size={20} weight="light" />}
            </span>
        </button>

        <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}
        >
            <ul className="space-y-3 pl-2">
                {group.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-[13px] md:text-[15px] text-neutral-600 font-light leading-relaxed">
                    <span className="w-[3px] h-[3px] bg-black rounded-full mt-[9px] shrink-0"></span>
                    <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    );
   };

  return (
    <MainLayout>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-500 ${showBooking ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={handleCloseBooking}
      ></div>

    {/* --- FORM ĐẶT PHÒNG --- */}
      <div 
        className={`
            fixed top-0 left-0 w-full bg-white z-50 shadow-2xl 
            transition-transform duration-700 cubic-bezier(0.77, 0, 0.175, 1)
            ${showBooking ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
         <div className="container mx-auto px-6 py-8 md:py-10 relative">
            
            <button onClick={handleCloseBooking} className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors">
                <X size={32} weight="light" />
            </button>

            <h3 className="text-center font-serif text-2xl uppercase tracking-widest mb-8 text-neutral-900">
                Đặt phòng {room.title} ngay
            </h3>

            <form className="flex flex-col xl:flex-row items-end justify-center gap-6 md:gap-8 w-full">
                
                <div className="relative w-full md:w-[400px] xl:flex-1">
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                        NGÀY ĐẶT PHÒNG - NGÀY TRẢ PHÒNG
                    </label>
                    
                    <div 
                       onClick={() => setActivePopup(activePopup === 'calendar' ? null : 'calendar')}
                       className={`
                           bg-stone-50 p-3 flex items-center justify-between h-14 cursor-pointer 
                           hover:bg-stone-100 transition-colors border-b border-neutral-300
                           ${activePopup === 'calendar' ? 'ring-1 ring-black bg-white' : ''}
                       `}
                    >
                       <span className="text-lg font-serif italic text-neutral-800">
                          {checkInDate && checkOutDate 
                            ? `${formatDateVN(checkInDate)} - ${formatDateVN(checkOutDate)}` 
                            : "Chọn ngày..."}
                       </span>
                       {activePopup === 'calendar' 
                         ? <X size={20} weight="bold" /> 
                         : <CalendarBlank size={24} className="text-neutral-400" />
                       }
                    </div>

                    {activePopup === 'calendar' && (
                       <CalendarSelector 
                          onClose={() => setActivePopup(null)} 
                          onDateSelect={handleDateSelect} 
                          initialStartDate={checkInDate}
                          initialEndDate={checkOutDate}
                          bookedRanges={bookedRanges}
                       />
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <button 
                        type="button"
                        onClick={handleBookNow}
                        className="flex items-center justify-center gap-3 h-14 px-10 bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full md:w-auto min-w-[220px]"
                    >
                        <CreditCard size={20} weight="bold" />
                        Thanh toán ngay
                    </button>
                    
                    <button 
                        type="button"
                        onClick={handleAddToCart}
                        className="group flex items-center justify-center gap-3 h-14 px-8 border border-neutral-300 bg-white text-neutral-900 text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-300 w-full md:w-auto min-w-[200px]"
                    >
                        <ShoppingCartSimple size={20} weight="bold" className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                        Thêm vào giỏ
                    </button>
                </div>
            </form>
         </div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative h-screen w-full overflow-hidden">
        <img src={room.hero.image} alt={room.title} className="w-full h-full object-cover animate-scale-slow"/>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-16 px-6 z-10 text-center">
            <h1 className="text-3xl md:text-6xl font-playfair italic font-semibold text-white uppercase tracking-[0.15em] mb-15 drop-shadow-xl">
                {room.title}
            </h1>
            <div className="max-w-3xl mx-auto mb-8">
                <p className="text-lg md:text-xl text-white/90 leading-relaxed italic font-light">"{room.hero.subtitle || room.title}"</p>
                <div className="w-24 h-px bg-white/70 mx-auto mt-6"></div>
            </div>
            {room.is_available === false ? (
               <div className="border border-neutral-500 bg-neutral-900/50 text-neutral-400 w-full md:w-auto px-10 py-4 flex flex-col items-center justify-center gap-1 cursor-not-allowed backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.25em]">
                        <LockKey size={18} weight="fill" />
                        Tạm khóa
                  </div>
                  <span className="text-[11px] lowercase italic font-light tracking-normal opacity-60">
                        (Liên hệ để biết thêm chi tiết)
                  </span>
               </div>
            ) : (
               <button 
                     onClick={handleOpenBooking}
                     className="group relative overflow-hidden border border-neutral-200 bg-transparent text-neutral-200 w-full md:w-auto px-10 py-4 transition-all duration-300 cursor-pointer"
               >
                     <span className="absolute inset-0 w-full h-full bg-neutral-900 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></span>
                     <span className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] group-hover:text-white transition-colors duration-300">
                        Đặt phòng ngay
                     </span>
               </button>
            )}
        </div>
      </div>    

      {/* 2. GALLERY */}
      <div className="w-full overflow-hidden my-24 group">
         <div className="text-center mb-12">
            <h3 className="text-xl md:text-2xl font-serif uppercase tracking-[0.2em] text-neutral-900">Ảnh phòng</h3>
            <div className="w-12 h-px bg-neutral-400 mx-auto mt-4"></div>
         </div>

         <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, dynamicBullets: true }}
            spaceBetween={20}
            slidesPerView={1.2} 
            centeredSlides={true}
            loop={room.gallery.length > 1} 
            speed={800} 
            breakpoints={{
                768: { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
                1024: { slidesPerView: 3, centeredSlides: false, spaceBetween: 30 }
            }}
            className="w-full lg:w-[2500px] h-[300px] md:h-[500px] cursor-grab gallery-swiper relative left-1/2 -translate-x-1/2"
         >
            {(room.gallery.length < 4 ? [...room.gallery, ...room.gallery] : room.gallery).map((img, index) => (
                <SwiperSlide key={index} className="overflow-hidden bg-neutral-100">
                    <img src={img} alt={`Room Gallery ${index}`} className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105" />
                </SwiperSlide>
            ))}
         </Swiper>
      </div>

      {/* 3. DETAILS */}
      <div className="container mx-auto px-6 max-w-7xl mb-24 mt-20">
         <div className="text-center mb-16">
            <h3 className="text-2xl font-serif uppercase tracking-[0.2em] text-neutral-900">
               Chi tiết phòng
            </h3>
            <div className="w-12 h-px bg-neutral-400 mx-auto mt-4"></div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-15 gap-y-15">
             <div className="border-t border-neutral-300 pt-6">
               <div className="flex items-center gap-3 mb-4">
                  <Bed size={24} weight="light" className="text-neutral-900" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
                     Giường ngủ
                  </h4>
               </div>
               <ul className="list-disc pl-5 text-[13px] md:text-[14px] text-neutral-600 space-y-2 font-light leading-relaxed">
                    {room.details?.beds?.map((bed, i) => (<li key={i}>{bed}</li>))}
                </ul>
            </div>

            <div className="border-t border-neutral-300 pt-6">
               <div className="flex items-center gap-3 mb-4">
                  <Users size={24} weight="light" className="text-neutral-900" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
                     Sức chứa tối đa
                  </h4>
               </div>
               <ul className="list-disc pl-5 text-[13px] md:text-[14px] text-neutral-600 space-y-2 font-light leading-relaxed">
                  {room.details?.occupancy?.map((occ, i) => <li key={i}>{occ}</li>)}
               </ul>
            </div>

            {room.details?.otherroom?.length > 0 && (
               <div className="border-t border-neutral-300 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                        <House size={24} weight="light" className="text-neutral-900" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
                           Các phòng khác
                        </h4>
                  </div>
                  <ul className="list-disc pl-5 text-[13px] md:text-[14px] text-neutral-600 space-y-2 font-light leading-relaxed">
                        {room.details.otherroom.map((r, i) => (
                           <li key={i}>{r}</li>
                        ))}
                  </ul>
               </div>
            )}

            <div className="border-t border-neutral-300 pt-6">
               <div className="flex items-center gap-3 mb-4">
                  <Bathtub size={24} weight="light" className="text-neutral-900" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
                     Phòng tắm
                  </h4>
               </div>
               <ul className="list-disc pl-5 text-[13px] md:text-[14px] text-neutral-600 space-y-2 font-light leading-relaxed">
                  {room.details?.bathroom?.map((b, i) => <li key={i}>{b}</li>)}
               </ul>
            </div>

            <div className="border-t border-neutral-300 pt-6">
               <div className="flex items-center gap-3 mb-4">
                  <Binoculars size={24} weight="light" className="text-neutral-900" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
                     Tầm nhìn
                  </h4>
               </div>
               <ul className="list-disc pl-5 text-[13px] md:text-[14px] text-neutral-600 space-y-2 font-light leading-relaxed">
                  {room.details?.views?.map((v, i) => <li key={i}>{v}</li>)}
               </ul>
            </div>
         </div>
      </div>

      {/* 4. AMENITIES */}
      <div className="container mx-auto px-6 max-w-7xl mb-24">
         <div className="text-center mb-16">
            <h3 className="text-xl uppercase tracking-[0.2em] text-neutral-900">
               Tiện ích & Dịch vụ
            </h3>
             <div className="w-12 h-px bg-neutral-400 mx-auto mt-4"></div>
         </div>

         <div className="border-b border-neutral-200">
            {room.amenities.map((group, idx) => (
               <AmenityItem key={idx} group={group}/>
            ))}
         </div>
      </div>

      {/* 5. BOTTOM CTA BAR */}
      <div className="bg-white py-16 md:py-24">
         <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="bg-neutral-900 rounded-4xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <div className="text-center md:text-left z-10">
                  <p className="text-xs md:text-sm text-neutral-400 uppercase tracking-[0.25em] mb-3 font-medium">
                      Bắt đầu kỳ nghỉ trong mơ
                  </p>
                  
                  <div className="flex items-baseline justify-center md:justify-start gap-3">
                     <span className="text-neutral-400 text-sm font-serif italic">Chỉ từ</span>
                     <span className="text-4xl md:text-5xl font-playfair italic text-white tracking-wide">
                        {formatPrice(room.base_price)}
                     </span>
                     <span className="text-lg text-neutral-500 font-light">/ đêm</span>
                  </div>
               </div>

               <div className="hidden md:block w-px h-20 bg-linear-to-b from-transparent via-white/20 to-transparent"></div>

               <div className="z-10 w-full md:w-auto">
                   {room.is_available === false ? (
                     <div className="bg-neutral-800 border border-neutral-700 text-neutral-400 w-full md:w-auto px-12 py-5 rounded-full flex flex-col items-center justify-center gap-1 cursor-not-allowed shadow-inner">
                        <div className="flex items-center gap-2 text-[12px] md:text-xs font-bold uppercase tracking-[0.25em]">
                              <LockKey size={20} weight="fill" />
                              Tạm khóa
                        </div>
                        <span className="text-[11px] md:text-[11px] lowercase italic font-light tracking-normal opacity-50">
                              (Liên hệ để biết thêm chi tiết)
                        </span>
                     </div>
                  ) : (
                     <button 
                        onClick={handleOpenBooking}
                        className="group relative bg-white text-black w-full md:w-auto px-12 py-5 rounded-full overflow-hidden transition-all cursor-pointer duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                     >
                        <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-neutral-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        <span className="relative text-xs md:text-sm font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3">
                              Đặt phòng ngay
                              <ArrowRight size={20} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
    </MainLayout>
  );
};

export default RoomDetails;