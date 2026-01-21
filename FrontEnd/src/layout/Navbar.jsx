import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import { useCart } from '../context/CartContext';
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import {showError} from '../utils/toast.jsx'

// Hàm định dạng ngày theo chuẩn Việt Nam dd/mm/yyyy
const formatDateVN = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// --- COMPONENT CON: BỘ CHỌN KHÁCH (GUEST SELECTOR) ---
const GuestSelector = ({ onClose, onUpdate, adults, children }) => {
  // State quản lý danh sách phòng. Mặc định có 1 phòng.
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);

  const handleUpdate = () => {
    onUpdate(localAdults, localChildren); // Truyền 2 biến đơn
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white shadow-2xl p-6 z-50 border border-neutral-100 animate-fadeIn max-h-[80vh] overflow-y-auto">
      {/* Actions */}
      <div className="flex flex-col gap-4 mt-2">      
         <div className="space-y-6 mb-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest">Người lớn</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setLocalAdults(Math.max(1, localAdults - 1))} className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">−</button>
              <span className="font-serif font-bold">{localAdults}</span>
              <button onClick={() => setLocalAdults(localAdults + 1)} className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">+</button>
            </div>
          </div>
          {/* Children */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest">Trẻ em</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setLocalChildren(Math.max(0, localChildren - 1))} className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">−</button>
              <span className="font-serif font-bold">{localChildren}</span>
              <button onClick={() => setLocalChildren(localChildren + 1)} className="w-8 h-8 border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">+</button>
            </div>
          </div>
        </div>

         <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <span className="text-[10px] text-neutral-500 font-serif italic">
              Số người | {localAdults} Người lớn, {localChildren} Trẻ em
            </span>
            <button 
               onClick={handleUpdate}
               className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer px-6 py-3 hover:bg-neutral-800"
            >
               Cập nhật
            </button>
         </div>
      </div>
    </div>
  );
};

// --- COMPONENT CON: BỘ CHỌN NGÀY (CALENDAR) ---
const CalendarSelector = ({ onClose, onDateSelect, initialStartDate, initialEndDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Ngày hiện tại (để chặn chọn ngày quá khứ)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDayClick = (day) => {
    // Không cho chọn ngày quá khứ
    if (day < today) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day > startDate) {
        setEndDate(day);
      } else {
        setStartDate(day);
        setEndDate(null);
      }
    }
  };

  // Xóa ngày đã chọn (Reset)
  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleDone = () => {
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
       const isPast = date < today;
       
       // Logic bôi đen toàn bộ line
       const isStart = startDate && date.getTime() === startDate.getTime();
       const isEnd = endDate && date.getTime() === endDate.getTime();
       const isInRange = startDate && endDate && date > startDate && date < endDate;
       
       // Check xem có phải ngày được chọn hoặc nằm trong khoảng không
       const isSelectedOrRange = isStart || isEnd || isInRange;

       days.push(
         <div 
           key={i} 
           onClick={() => handleDayClick(date)}
           className={`
             h-10 w-10 flex items-center justify-center text-xs font-medium cursor-pointer rounded-full transition-colors
             ${isPast ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:bg-stone-100'}
             /* Bôi đen toàn bộ line: Start, End và khoảng giữa đều màu đen chữ trắng */
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
    <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl p-8 z-50 w-full md:w-[700px] border border-neutral-100 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
         <button onClick={() => changeMonth(-1)} className="text-xl font-light text-neutral-400 hover:text-black px-2">‹</button>
         <button onClick={() => changeMonth(1)} className="text-xl font-light text-neutral-400 hover:text-black px-2">›</button>
      </div>

      <div className="flex gap-12 overflow-x-auto pb-4">
         {renderMonth(currentDate)}
         <div className="hidden md:block border-l border-neutral-100 pl-12">
            {renderMonth(nextMonthDate)}
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-neutral-100 mt-4 gap-4">
         <div className="flex items-center gap-4">
             {/* Nút xóa ngày (X) */}
             {(startDate || endDate) && (
               <button 
                 onClick={clearDates} 
                 className="text-[10px] tracking-[0.15em] uppercase text-red-500 hover:text-red-700 flex items-center gap-1"
               >
                 <span>&times;</span> Xoá
               </button>
             )}
         </div>

         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-neutral-400 italic font-serif">
               {startDate ? formatDateVN(startDate) : "ngày đặt phòng"} - {endDate ? formatDateVN(endDate) : "ngày trả phòng"}
            </span>
            <button 
               onClick={handleDone}
               className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3 hover:bg-neutral-800"
            >
               Xác nhận
            </button>
         </div>
      </div>
    </div>
  );
};

// --- COMPONENT NAVBAR CHÍNH ---
const Navbar = () => {
  const navLinks = [
    { name: "TRANG CHỦ", path: "/" },
    { name: "XEM PHÒNG", path: "/list-rooms" },
    { name: "TRẢI NGHIỆM", path: "/experience" },
    { name: "KHÁM PHÁ", path: "/discover" },
    { name: "ẨM THỰC", path: "/dining" },
    { name: "ƯU ĐÃI", path: "/offers" },
    { name: "TRA CỨU", path: "/find" },
    { name: "LIÊN HỆ", path: "/contact" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  
  // State quản lý danh sách phòng (Multi-room)
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const navigate = useNavigate();
  const { setIsCartOpen, cart } = useCart();

  const handleDateSelect = (start, end) => {
     setCheckInDate(start);
     setCheckOutDate(end);
  };

  // Cập nhật state khi form guest thay đổi
  const handleGuestUpdate = (a, c) => {
    setAdults(a);
    setChildren(c);
  };

  // Tính tổng hiển thị trên thanh booking bar
  const totalGuestsSummary = () => {
    return `Số người - ${adults} Người lớn, ${children} Trẻ em`;
  };

  const handleSearchQuick = async () => {
    // 1. Validate dữ liệu đầu vào
    if (!checkInDate || !checkOutDate) {
      showError("Vui lòng chọn ngày nhận và trả phòng!");
      setActivePopup('calendar'); // Tự động mở popup chọn ngày cho khách
      return;
    }

    try {
      // 2. Gọi API tìm phòng thông minh
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_URL}/api/v1/rooms/find-available`, {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: adults,
        children: children
      });

      if (res.data.success && res.data.data) {
        const targetRoom = res.data.data;
        
        // 3. Đóng menu đặt phòng và chuyển hướng
        setIsBookingOpen(false); 
        
        // Điều hướng đến trang chi tiết phòng
        navigate(`/rooms/${targetRoom.slug}`, { 
           state: { 
              checkInDate, 
              checkOutDate,
              adults,
              children
           } 
        });
      }

    } catch (error) {
      // Xử lý lỗi trả về từ server
      if (error.response && error.response.status === 404) {
        showError(error.response.data.message); // Hiển thị thông báo cụ thể từ Backend (VD: Hết phòng...)
      } else {
        console.error("Lỗi tìm kiếm:", error);
        showError("Có lỗi xảy ra khi tìm phòng. Vui lòng thử lại.");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen || isBookingOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen, isBookingOpen]);

  useEffect(() => {
     if (!isBookingOpen) setActivePopup(null);
  }, [isBookingOpen]);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 w-full z-50 
          flex items-center justify-between
          transition-all duration-500 ease-in-out
          ${isScrolled 
            ? "bg-black/95 shadow-xl py-3 backdrop-blur-md" 
            : "bg-linear-to-b from-black/60 to-transparent py-6"
          }
        `}
      >
        {/* --- 1. SỬA DESKTOP VIEW --- */}
        <div className="hidden xl:flex w-full items-center justify-between px-6 lg:px-8 xl:px-12">
          <a href="/" className="flex items-center shrink-0">
            <img src={assets.logo} alt="Logo" className={`object-contain transition-all duration-500 ${isScrolled ? "h-10" : "h-12"}`} />
          </a>

          {/* Điều chỉnh gap để vừa vặn với màn laptop: lg:gap-4 xl:gap-8 */}
          <div className="hidden xl:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <a key={i} href={link.path} className="group relative flex flex-col items-center gap-1">
                {/* Giảm size chữ một chút nếu cần thiết trên màn nhỏ: text-[11px] hoặc text-[12px] */}
                <span className="text-[11px] xl:text-[13px] tracking-[0.15em] xl:tracking-[0.2em] uppercase text-white font-medium opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.name}
                </span>
                <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 xl:gap-6">
            <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative p-2 rounded-full border border-white/30 group-hover:border-white transition-colors">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  
                  {cart?.items?.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                          {cart.items.length}
                      </span>
                  )}
              </div>
              {/* Chỉ hiện chữ GIỎ HÀNG ở màn hình to hẳn, màn laptop ẩn đi cho đỡ chật */}
              <span className="hidden 2xl:block text-[12px] uppercase tracking-widest text-white">Giỏ hàng</span>
            </button>

            <button 
              onClick={() => setIsBookingOpen(!isBookingOpen)}
              className={`
                px-4 xl:px-6 py-2.5 rounded-sm text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-all duration-500 whitespace-nowrap
                ${isScrolled ? "bg-white text-black hover:bg-neutral-200" : "bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-black"}
              `}
            >
              {isBookingOpen ? "Đóng" : "Đặt nhanh"}
            </button>
          </div>
        </div>

        {/* --- 2. SỬA MOBILE HEADER --- */}
        {/* Đổi từ 'flex 2xl:hidden' thành 'flex xl:hidden' để ẩn trên laptop */}
        <div className="flex xl:hidden w-full items-center justify-between px-5">
          <a href="/"><img src={assets.logo} alt="Logo" className="h-8 object-contain" /></a>
          
          <div className="flex items-center gap-5">
             <button 
                onClick={() => setIsCartOpen(true)} 
                className="text-white relative"
             >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {cart?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-black">
                        {cart.items.length}
                    </span>
                )}
             </button>

             <button onClick={() => setIsMenuOpen(true)} className="text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
             </button>
          </div>
        </div>
      </nav>

      {/* ================= BOOKING BAR ================= */}
      <div
        className={`
          fixed left-0 w-full z-40
          transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
          top-0 pt-20 md:pt-[90px] 
          ${isBookingOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"}
        `}
      >
        <div className={`absolute inset-0 bg-black/50 h-screen transition-opacity duration-500 -z-10 ${isBookingOpen ? 'opacity-100' : 'opacity-0'}`} />

        <div className="bg-white shadow-2xl border-t border-neutral-100 w-full">
          <div className="max-w-[1200px] mx-auto px-6 py-8 md:py-10">
            <div className="flex justify-end mb-2">
                <button onClick={() => setIsBookingOpen(false)} className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 hover:text-black flex items-center gap-1 transition-colors">
                    Đóng <span className="text-lg leading-none">&times;</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              {/* 1. CHECK IN - CHECK OUT */}
              <div className="md:col-span-6 lg:col-span-5 relative">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-800 mb-2">NGÀY ĐẶT PHÒNG - NGÀY THANH TOÁN</label>
                <div 
                   onClick={() => setActivePopup(activePopup === 'calendar' ? null : 'calendar')}
                   className={`bg-stone-100 p-3 flex items-center justify-between h-[50px] cursor-pointer hover:bg-stone-200 transition-colors ${activePopup === 'calendar' ? 'ring-1 ring-black bg-white' : ''}`}
                >
                   <span className="text-sm font-serif italic text-neutral-700">
                      {checkInDate && checkOutDate 
                        ? `${formatDateVN(checkInDate)} - ${formatDateVN(checkOutDate)}` 
                        : "Chọn ngày"}
                   </span>
                   {activePopup === 'calendar' 
                     ? <span className="text-lg">&times;</span> 
                     : <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                   }
                </div>
                {activePopup === 'calendar' && (
                   <CalendarSelector 
                      onClose={() => setActivePopup(null)} 
                      onDateSelect={handleDateSelect} 
                      initialStartDate={checkInDate}
                      initialEndDate={checkOutDate}
                   />
                )}
              </div>

              {/* 2. GUESTS (MULTI ROOM) */}
              <div className="md:col-span-6 lg:col-span-4 relative">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-800 mb-2">Khách hàng</label>
                <div 
                   onClick={() => setActivePopup(activePopup === 'guest' ? null : 'guest')}
                   className={`bg-stone-100 p-3 h-[50px] flex items-center justify-between cursor-pointer hover:bg-stone-200 transition-colors ${activePopup === 'guest' ? 'ring-1 ring-black bg-white' : ''}`}
                >
                  <span className="text-sm font-serif italic text-neutral-700 truncate pr-2">
                     {totalGuestsSummary()}
                  </span>
                  <div className={`transition-transform duration-300 shrink-0 ${activePopup === 'guest' ? 'rotate-180' : ''}`}>
                     <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                {activePopup === 'guest' && (
                   <GuestSelector 
                      onClose={() => setActivePopup(null)} 
                      onUpdate={handleGuestUpdate}
                      adults={adults}
                      children={children}
                   />
                )}
              </div>

              {/* 3. BUTTON CHECK RATES */}
              <div className="md:col-span-12 lg:col-span-3">
                <button
                onClick={handleSearchQuick}
                className="w-full h-[50px] bg-black text-white text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-800 cursor-pointer transition-colors duration-300 shadow-lg">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE MENU ================= */}
      <div className={`fixed inset-0 z-999 xl:hidden transition-all duration-500 ${isMenuOpen ? "visible" : "invisible delay-500"}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)}/>
        <div className={`absolute top-0 left-0 h-screen w-[75%] max-w-[350px] bg-neutral-900 shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="shrink-0 pt-8 px-6 pb-6 border-b border-white/10">
             <img src={assets.logo} alt="Logo" className="h-10 object-contain mb-4" />
          </div>
          <nav className="flex-1 flex flex-col justify-evenly px-6 py-4 overflow-y-auto">
            {navLinks.map((link, i) => (
              <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)} className="group flex items-center justify-between text-white py-2 border-b border-white/5">
                <span className="text-[13px] uppercase tracking-[0.2em] font-medium text-neutral-300 group-hover:text-white transition-colors">{link.name}</span>
                <span className="text-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&rarr;</span>
              </a>
            ))}
          </nav>
          <div className="shrink-0 p-6 border-t border-white/10 bg-neutral-900">
            <button onClick={() => { setIsMenuOpen(false); setIsBookingOpen(true); }} className="flex items-center justify-center h-12 w-full bg-white text-black text-[12px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-neutral-200 transition-colors">
              Đặt phòng nhanh
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;