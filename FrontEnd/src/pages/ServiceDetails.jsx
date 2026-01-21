import React, { useEffect, useState, useRef } from 'react'; 
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../layout/MainLayout';
import { useCart } from '../context/CartContext';
import { showSuccess, showError } from '../utils/toast';

// --- HELPER: FORMAT DATE ---
const formatDateVN = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const parsePrice = (priceString) => {
    if (!priceString) return 0;
    if (typeof priceString === 'number') return priceString;
    return parseInt(priceString.replace(/\D/g, ''), 10);
};

// --- COMPONENT: LỊCH CHỌN NHIỀU NGÀY (FIXED) ---
const MultiDateCalendarSelector = ({ onClose, onDateSelect, initialDates, validRange }) => {
  const toTimestamp = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const minValidTs = validRange?.start ? toTimestamp(validRange.start) : null;
  const maxValidTs = validRange?.end ? toTimestamp(validRange.end) : null;
  const todayTs = toTimestamp(new Date());

  const [currentDate, setCurrentDate] = useState(() => {
    return validRange?.start ? new Date(validRange.start) : new Date();
  });
  
  const [tempSelectedDates, setTempSelectedDates] = useState(initialDates || []);

  useEffect(() => {
    if (validRange?.start) {
        setCurrentDate(new Date(validRange.start));
    }
  }, [validRange]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDayClick = (date) => {
    const dayTs = toTimestamp(date);
    
    if (dayTs < todayTs) return;
    if (minValidTs && dayTs < minValidTs) return;
    if (maxValidTs && dayTs > maxValidTs) return;

    const exists = tempSelectedDates.find(d => toTimestamp(d) === dayTs);
    if (exists) {
        setTempSelectedDates(prev => prev.filter(d => toTimestamp(d) !== dayTs));
    } else {
        setTempSelectedDates(prev => [...prev, new Date(dayTs)].sort((a, b) => a - b));
    }
  };

  const handleDone = (e) => {
      e.preventDefault(); 
      onDateSelect(tempSelectedDates);
      onClose();
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();

    let days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`empty-${i}`} />);
    
    for (let i = 1; i <= daysInMonth; i++) {
       const date = new Date(year, month, i);
       const dayTs = toTimestamp(date);
       
       const isPast = dayTs < todayTs;
       const isOutOfRange = (minValidTs && dayTs < minValidTs) || (maxValidTs && dayTs > maxValidTs);
       
       const isDisabled = isPast || isOutOfRange;
       const isSelected = tempSelectedDates.some(d => toTimestamp(d) === dayTs);

       days.push(
         <div 
           key={i} 
           onClick={() => !isDisabled && handleDayClick(date)}
           className={`
             h-10 w-10 flex items-center justify-center text-xs font-medium rounded-full transition-all duration-200
             ${isDisabled 
                ? 'text-neutral-300 bg-stone-50 cursor-not-allowed opacity-50' 
                : 'text-neutral-700 hover:bg-stone-200 cursor-pointer'} 
             ${isSelected ? 'bg-black! text-white! shadow-md transform scale-105' : ''}
             ${!isDisabled && !isSelected ? 'bg-green-50/50 text-green-900 font-semibold' : ''}
           `}
         >
            {i}
         </div>
       );
    }
    
    return (
      <div className="flex-1 min-w-[280px]">
         <div className="text-center mb-6 font-serif italic text-lg text-neutral-800 capitalize">
            Tháng {month + 1}, {year}
         </div>
         <div className="grid grid-cols-7 mb-4 text-[10px] font-bold tracking-widest text-neutral-400 text-center">
            <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center">
            {days}
         </div>
      </div>
    );
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl p-8 z-60 w-full md:w-[400px] border border-neutral-100 animate-fadeIn text-left">
      <div className="flex justify-between items-center mb-4">
         <button type="button" onClick={() => changeMonth(-1)} className="text-xl font-light text-neutral-400 hover:text-black px-2 py-1">‹</button>
         <button type="button" onClick={() => changeMonth(1)} className="text-xl font-light text-neutral-400 hover:text-black px-2 py-1">›</button>
      </div>

      <div className="pb-4 border-b border-neutral-100">
         {renderMonth(currentDate)}
      </div>

      <div className="flex items-center justify-between pt-4 mt-2">
         <span className="text-xs text-neutral-400 italic font-serif">
            Đã chọn: <span className="text-black font-medium">{tempSelectedDates.length}</span> ngày
         </span>
         <button 
            type="button"
            onClick={handleDone}
            className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-2 hover:bg-neutral-800 transition-colors"
         >
            Xác nhận
         </button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const ServiceDetails = () => {
  const { slug } = useParams();
  const location = useLocation(); 
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, setIsCartOpen } = useCart();

  // State Form
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null); 
  const [selectedRate, setSelectedRate] = useState(null);       
  const [bookingCode, setBookingCode] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [activePopup, setActivePopup] = useState(null); 
  
  // Logic validate
  const [isVerifying, setIsVerifying] = useState(false); 
  const [isValidBooking, setIsValidBooking] = useState(false); 
  const [validRange, setValidRange] = useState(null); 
  const [validationError, setValidationError] = useState('');
  const typingTimeoutRef = useRef(null); 
  const [previewIndex, setPreviewIndex] = useState(null);

  const CATEGORY_TRANSLATIONS = {
    'Wellness': 'Sức Khỏe & Thư Giãn', 'Vitality': 'Năng Lượng & Thể Thao', 'Festive': 'Lễ Hội & Văn Hóa',
    'Breakfast': 'Thực Đơn Bữa Sáng', 'Lunch': 'Bữa Trưa Sang Trọng', 'Afternoon': 'Trà Chiều & Nhẹ', 'Dinner': 'Bữa Tối Lãng Mạn',
    'Nature': 'Thiên Nhiên & Khám Phá', 'Heritage': 'Di Sản & Văn Hóa', 'Trend': 'Xu Hướng & Phong Cách',
    'Shuttle': 'Dịch Vụ Di Chuyển', 'Clean': 'Dịch Vụ Buồng Phòng', 'Other': 'Dịch Vụ Khác'
  };

  const getContext = () => {
    if (location.pathname.includes('/am-thuc')) return { label: 'ẨM THỰC', backLink: '/am-thuc', backText: 'Quay lại Ẩm thực' };
    if (location.pathname.includes('/kham-pha')) return { label: 'KHÁM PHÁ', backLink: '/kham-pha', backText: 'Quay lại Khám phá' };
    return { label: 'TRẢI NGHIỆM', backLink: '/trai-nghiem', backText: 'Quay lại Trải nghiệm' };
  };
  const context = getContext();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/full-service/${slug}`);
        if (response.data.success) {
          const fetchedService = response.data.data;
          setService(fetchedService);
          if (fetchedService.pricing_options && fetchedService.pricing_options.length > 0) {
            const firstPackage = fetchedService.pricing_options[0];
            setSelectedPackage(firstPackage);
            if (firstPackage.rates && firstPackage.rates.length > 0) {
                setSelectedRate(firstPackage.rates[0]);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (previewIndex === null) return;

        if (e.key === 'ArrowRight') {
            // Chuyển sang ảnh tiếp theo (vòng lặp lại ảnh đầu nếu hết)
            setPreviewIndex((prev) => (prev + 1) % service.gallery.length);
        } else if (e.key === 'ArrowLeft') {
            // Quay lại ảnh trước (vòng lặp lại ảnh cuối nếu đang ở đầu)
            setPreviewIndex((prev) => (prev - 1 + service.gallery.length) % service.gallery.length);
        } else if (e.key === 'Escape') {
            // Nhấn ESC để đóng
            setPreviewIndex(null);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Cleanup để tránh rò rỉ bộ nhớ
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [previewIndex, service?.gallery]);

  // --- LOGIC DEBOUNCE & AUTO PREFIX ---
  useEffect(() => {
      if (!bookingCode) {
          setIsValidBooking(false);
          setValidRange(null);
          setSelectedDates([]); 
          setIsVerifying(false);
          setValidationError(''); // Reset lỗi khi xóa trắng
          return;
      }

      if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
      }

      setIsVerifying(true); 
      setIsValidBooking(false); 
      setValidationError(''); // Reset lỗi khi đang gõ mới

      typingTimeoutRef.current = setTimeout(async () => {
          try {
              let cleanCode = bookingCode.trim();
              if (!cleanCode.startsWith("FS-")) {
                  cleanCode = `FS-${cleanCode}`;
              }
              
              const API_URL = import.meta.env.VITE_API_URL;
              const response = await axios.get(`${API_URL}/api/v1/invoices/validate/${cleanCode}`);
              
              if (response.data.success) {
                  setIsValidBooking(true);
                  setValidRange({
                      start: response.data.data.validStartDate,
                      end: response.data.data.validEndDate
                  });
                  setValidationError(''); // Xóa lỗi nếu thành công
              } 
          } catch (error) {
              setIsValidBooking(false);
              setValidRange(null);
              // [MỚI] Hiển thị thông báo lỗi cụ thể từ Backend
              if (error.response && error.response.data && error.response.data.message) {
                  setValidationError(error.response.data.message);
              }
          } finally {
              setIsVerifying(false);
          }
      }, 500);

      return () => {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
  }, [bookingCode]);

    useEffect(() => {
        // Nếu previewIndex khác null (đang mở ảnh) thì khóa cuộn
        if (previewIndex !== null) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
    }, [previewIndex]);


  const handleSelectPackage = (pkg) => {
      setSelectedPackage(pkg);
      if (pkg.rates && pkg.rates.length > 0) setSelectedRate(pkg.rates[0]);
      else setSelectedRate(null);
  };

  const handleSelectRate = (rate, e) => {
      e.stopPropagation();
      setSelectedRate(rate);
  };

  const handleOpenBooking = () => setShowBooking(true);
  const handleCloseBooking = () => {
      setShowBooking(false);
      setActivePopup(null);
  };

  const handleDatesUpdate = (dates) => {
      setSelectedDates(dates);
  };

  const handleAddToCart = async (e) => {
      e.preventDefault();

      if (!isValidBooking) {
          showError("Vui lòng nhập Mã đặt phòng hợp lệ.");
          return;
      }
      if (!selectedPackage || !selectedRate) {
          showError("Vui lòng chọn gói dịch vụ và mức giá.");
          return;
      }
      if (selectedDates.length === 0) {
          showError("Vui lòng chọn ít nhất 1 ngày sử dụng dịch vụ.");
          return;
      }

      const numericPrice = parsePrice(selectedRate.price);
      if (isNaN(numericPrice) || numericPrice === 0) {
          showError("Giá dịch vụ không hợp lệ.");
          return;
      }

      const calculatedTotal = numericPrice * selectedDates.length;
      
      // [LOGIC SAVE]: Lưu đầy đủ "FS-..." vào giỏ hàng
      let finalBookingCode = bookingCode.trim();
      if (!finalBookingCode.startsWith("FS-")) {
          finalBookingCode = `FS-${finalBookingCode}`;
      }

      const cartItem = {
          type: service.type,
          itemId: service._id, 
          title: service.title,
          packageTitle: selectedPackage.title,
          rateLabel: selectedRate.label,
          price: numericPrice, 
          totalPrice: calculatedTotal,
          image: service.gallery?.[0], 
          bookingCode: finalBookingCode,
          dates: selectedDates, 
          quantity: selectedDates.length,
      };

      try {
          await addToCart(cartItem);
          setShowBooking(false);
          setIsCartOpen(false);
          showSuccess("Đã thêm dịch vụ vào đơn hàng!");
      } catch (error) {
          console.error(error);
          showError(error.message);
      }
  };

  const getDateDisplayString = () => {
      if (selectedDates.length === 0) return "Chọn ngày...";
      if (selectedDates.length <= 2) {
          return selectedDates.map(d => formatDateVN(d)).join(", ");
      }
      return `${selectedDates.length} ngày đã chọn`;
  };

  if (loading) return <MainLayout><div className="h-screen flex items-center justify-center text-xs font-bold tracking-[0.2em] animate-pulse">ĐANG TẢI DỮ LIỆU...</div></MainLayout>;
  if (!service) return <MainLayout><div className="h-screen flex items-center justify-center flex-col gap-4"><h2 className="text-xl font-serif">Không tìm thấy dịch vụ</h2><Link to="/" className="text-sm underline">Về trang chủ</Link></div></MainLayout>;

  return (
    <MainLayout>
       <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-500 ${showBooking ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={handleCloseBooking}
      ></div>

      {/* --- FORM ĐẶT DỊCH VỤ (SLIDE DOWN) --- */}
      <div 
        className={`
            fixed top-0 left-0 w-full bg-white z-50 shadow-2xl 
            transition-transform duration-700 cubic-bezier(0.77, 0, 0.175, 1)
            ${showBooking ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
         <div className="container mx-auto px-6 py-8 md:py-10 relative max-w-5xl">
            
            <button onClick={handleCloseBooking} className="absolute top-4 right-6 text-neutral-400 hover:text-black transition-colors">
                <span className="text-3xl">&times;</span>
            </button>

            <div className="text-center mb-8">
                <h3 className="font-playfair text-2xl uppercase tracking-widest text-neutral-900 mb-2">
                    {selectedPackage?.title || service.title}
                </h3>
                <p className="text-sm text-neutral-500 italic">
                   {selectedRate?.label} — {selectedRate?.price} / ngày
                </p>
            </div>

            <form className="flex flex-col lg:flex-row items-end justify-center gap-6 w-full">
                
                {/* 1. MÃ ĐẶT PHÒNG - [UI MỚI]: INPUT GROUP "FS-..." */}
                <div className="w-full lg:w-1/3">
                    <div className="flex justify-between items-center mb-2">
                         <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">
                            Mã đặt phòng *
                        </label>
                    </div>
                    
                    {/* CONTAINER INPUT GROUP */}
                    <div className={`
                        flex items-center w-full h-[50px] bg-stone-50 border-b transition-colors
                        ${isValidBooking ? 'border-green-500 bg-green-50/20' : (validationError ? 'border-red-500 bg-red-50/10' : 'border-neutral-300 focus-within:border-black')}
                    `}>
                        {/* PREFIX CỐ ĐỊNH */}
                        <div className="h-full flex items-center justify-center pl-4 pr-1 bg-transparent select-none">
                            <span className={`font-serif text-lg translate-y-px ${validationError ? 'text-red-400' : 'text-neutral-400'}`}>FS-</span>
                        </div>
                        
                        {/* INPUT THỰC TẾ */}
                        <input 
                            type="text" 
                            value={bookingCode}
                            onChange={(e) => {
                                let val = e.target.value.toUpperCase().replace('FS-', '').replace('FS', '');
                                setBookingCode(val);
                            }}
                            placeholder="XXXX"
                            className={`w-full h-full bg-transparent px-1 font-serif text-lg focus:outline-none uppercase placeholder:text-neutral-300 ${validationError ? 'text-red-600' : 'text-neutral-900'}`}
                        />
                    </div>
                </div>

                {/* 2. CHỌN NGÀY (MULTI DATE) */}
                <div 
                    className={`relative w-full lg:w-1/3 transition-all duration-300 ${!isValidBooking ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}
                >
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                        Ngày sử dụng *
                    </label>
                    <div 
                       onClick={() => isValidBooking && setActivePopup(activePopup === 'calendar' ? null : 'calendar')}
                       className={`
                           bg-stone-50 p-3 flex items-center justify-between h-[50px] cursor-pointer 
                           hover:bg-stone-100 transition-colors border-b border-neutral-300
                           ${activePopup === 'calendar' ? 'ring-1 ring-black bg-white' : ''}
                       `}
                    >
                       <span className="text-sm font-serif italic text-neutral-800 truncate pr-2">
                          {getDateDisplayString()}
                       </span>
                       <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    
                    {activePopup === 'calendar' && isValidBooking && (
                       <MultiDateCalendarSelector 
                          onClose={() => setActivePopup(null)} 
                          onDateSelect={handleDatesUpdate} 
                          initialDates={selectedDates}
                          validRange={validRange} 
                       />
                    )}
                </div>

                {/* 3. BUTTON ADD TO CART */}
                <div 
                    className={`w-full lg:w-auto transition-all duration-300 ${!isValidBooking ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                    <button 
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full lg:w-auto flex items-center justify-center gap-3 h-[50px] px-8 bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Thêm vào giỏ
                    </button>
                </div>
            </form>
         </div>
      </div>

      {/* ... PHẦN DISPLAY DỊCH VỤ (KHÔNG THAY ĐỔI) ... */}
      <div className="bg-white min-h-screen pb-20 pt-28 md:pt-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            
            <div className="mb-12 md:mb-16 border-b border-black/10 pb-8">
                 <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-6 text-neutral-400">
                    <Link to={context.backLink} className="hover:text-black transition-colors">
                        {context.label}
                    </Link>
                    <span className="opacity-30">/</span>
                    <span className="text-black">
                        {CATEGORY_TRANSLATIONS[service.category] || service.category}
                    </span>
                </div>

                <div className="max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-playfair font-semibold italic leading-tight text-neutral-900 mb-6">
                        {service.title}
                    </h1>
                </div>
            </div>

            {service.gallery && service.gallery.length > 0 && (
                <div className="mb-20">
                    <div className="flex gap-6 overflow-x-auto pb-6 snap-x cursor-grab active:cursor-grabbing scrollbar-hide">
                        {service.gallery.map((img, idx) => (
                            <div key={idx} className="shrink-0 snap-center w-[280px] md:w-[350px] aspect-3/4 overflow-hidden group">
                                <img 
                                    src={img} 
                                    alt={`Gallery ${idx}`} 
                                    onClick={() => setPreviewIndex(idx)}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="h-px w-full bg-neutral-100 mt-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-1/4 bg-black animate-slide"></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                
                {/* === CỘT TRÁI === */}
                <div className="lg:col-span-8">
                    <div className="mb-16">
                        <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-8 text-neutral-400">Tổng quan</h3>
                        <div className="text-neutral-800 leading-loose text-lg font-light font-serif whitespace-pre-line text-justify">
                            {service.description}
                        </div>
                    </div>

                    {service.pricing_options && service.pricing_options.length > 0 && (
                        <div className="mb-20 border-t border-black/5 pt-16">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-neutral-400">Các gói dịch vụ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {service.pricing_options.map((option, idx) => {
                                    const isPackageSelected = selectedPackage && selectedPackage._id === option._id; 
                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => handleSelectPackage(option)}
                                            className={`
                                                p-8 transition-all duration-300 border cursor-pointer group relative flex flex-col h-full
                                                ${isPackageSelected 
                                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl scale-[1.02] z-10' 
                                                    : 'bg-stone-50 text-neutral-900 border-transparent hover:border-stone-200 hover:bg-white'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-serif text-2xl transition-colors ${isPackageSelected ? 'text-white' : 'text-neutral-900 group-hover:text-amber-700'}`}>
                                                    {option.title}
                                                </h4>
                                                {isPackageSelected && (
                                                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white text-black px-2 py-1 rounded-sm">Đang xem</span>
                                                )}
                                            </div>
                                            {option.description && (
                                                <p className={`text-sm italic mb-6 leading-relaxed ${isPackageSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                    {option.description}
                                                </p>
                                            )}
                                            <div className={`mt-auto space-y-3 pt-4 border-t transition-colors ${isPackageSelected ? 'border-white/20' : 'border-neutral-200 group-hover:border-amber-700/20'}`}>
                                                {option.rates.map((rate, rIdx) => {
                                                    const isRateSelected = isPackageSelected && selectedRate && selectedRate._id === rate._id;
                                                    return (
                                                        <div 
                                                            key={rIdx} 
                                                            onClick={(e) => handleSelectRate(rate, e)}
                                                            className={`
                                                                flex justify-between items-center p-2 rounded-sm transition-all
                                                                ${isPackageSelected ? (isRateSelected ? 'bg-white/20 ring-1 ring-white' : 'hover:bg-white/10') : ''}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isRateSelected && <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>}
                                                                <span className={`text-xs font-bold tracking-widest uppercase ${isPackageSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>{rate.label}</span>
                                                            </div>
                                                            <span className={`font-serif text-lg font-medium ${isPackageSelected ? 'text-white' : 'text-neutral-900'}`}>{rate.price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {service.important_info && service.important_info.length > 0 && (
                        <div className="mb-12 border-t border-black/5 pt-16">
                             <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-neutral-400">Lưu ý quan trọng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                {service.important_info.map((info, idx) => (
                                    <div key={idx}>
                                        <h5 className="font-bold text-[11px] uppercase tracking-[0.15em] text-black mb-4 flex items-center gap-3">
                                            <span className="w-1 h-1 bg-black rounded-full"></span>
                                            {info.title}
                                        </h5>
                                        <ul className="text-sm text-neutral-600 space-y-3 font-light leading-relaxed">
                                            {info.items.map((item, iIdx) => (
                                                <li key={iIdx} className="flex gap-3"><span className="text-neutral-300">-</span>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* === CỘT PHẢI (SIDEBAR) === */}
                <div className="lg:col-span-4">
                    <div className="sticky top-32">
                        <div className="bg-white border border-neutral-200 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500">
                            
                            <div className="mb-8 pb-8 border-b border-neutral-100 text-center">
                                <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">
                                    {selectedPackage ? selectedPackage.title : "Gói dịch vụ"}
                                </h4>
                                {selectedRate && <div className="text-xs font-serif italic text-neutral-500 mb-4">({selectedRate.label})</div>}
                                <p className="text-3xl md:text-4xl font-serif text-neutral-900">
                                    {selectedRate ? selectedRate.price : ""}
                                </p>
                            </div>

                            <div className="space-y-6 mb-10">
                                {service.details?.duration && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Thời lượng</span>
                                        <span className="text-neutral-900 font-medium font-serif">{service.details.duration}</span>
                                    </div>
                                )}
                                {service.details?.time_of_day && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Khung giờ</span>
                                        <span className="text-neutral-900 font-medium font-serif">{service.details.time_of_day}</span>
                                    </div>
                                )}
                                {service.details?.availability && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">Lịch hoạt động</span>
                                        <span className="text-neutral-900 font-medium font-serif text-right">{service.details.availability}</span>
                                    </div>
                                )}
                            </div>

                            {/* Kiểm tra trạng thái khả dụng của dịch vụ */}
                            {service.is_available === false ? (
                                <div className="w-full bg-neutral-100 text-neutral-400 py-4 px-2 text-[12px] font-bold uppercase tracking-[0.2em] mb-6 flex flex-col items-center justify-center gap-1 border border-neutral-200 cursor-not-allowed">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Tạm khóa
                                    </div>
                                    <span className="text-[11px] lowercase italic font-light tracking-normal opacity-80">
                                        (iên hệ để biết thêm chi tiết)
                                    </span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleOpenBooking}
                                    className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase cursor-pointer tracking-[0.2em] hover:bg-neutral-800 transition shadow-lg mb-6 active:scale-95"
                                >
                                    Đặt gói {selectedPackage ? selectedPackage.title : "ngay"}
                                </button>
                            )}
                            
                            <div className="text-center">
                                <Link to={context.backLink} className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
                                    &larr; {context.backText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <div 
        className={`fixed inset-0 z-100 flex items-center justify-center bg-black/95 transition-all duration-500 ease-in-out ${previewIndex !== null ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setPreviewIndex(null)}
      >
        {/* Nút Đóng */}
        <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-110 p-2"
            onClick={() => setPreviewIndex(null)}
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Nút Previous (Mũi tên trái) */}
        <button 
            className="absolute left-4 md:left-10 text-white/20 hover:text-white transition-all z-110 p-4 group"
            onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex - 1 + service.gallery.length) % service.gallery.length); }}
        >
            <svg className="w-12 h-12 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" />
            </svg>
        </button>

        {/* Khung chứa ảnh phóng to */}
        <div 
            className={`relative flex flex-col items-center justify-center transition-all duration-500 transform ${previewIndex !== null ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {previewIndex !== null && (
                <img 
                    src={service.gallery[previewIndex]} 
                    alt="Preview Full" 
                    className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl select-none border border-white/5"
                />
            )}
            
            {/* Chú thích & Số thứ tự */}
            <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">
                    {previewIndex + 1} / {service.gallery.length}
                </span>
            </div>
        </div>

        {/* Nút Next (Mũi tên phải) */}
        <button 
            className="absolute right-4 md:right-10 text-white/20 hover:text-white transition-all z-110 p-4 group"
            onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex + 1) % service.gallery.length); }}
        >
            <svg className="w-12 h-12 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" />
            </svg>
        </button>
      </div>
    </MainLayout>
  );
};

export default ServiceDetails;