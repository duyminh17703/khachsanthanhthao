import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Thêm Link
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { showSuccess, showError } from '../utils/toast';

import { 
  CalendarBlank, 
  ShoppingCartSimple, 
  CreditCard, 
  X, 
  ArrowRight, 
  CaretLeft, 
  CaretRight,
  Tag,
  Bed,
  Sparkle,
  CheckCircle,
  Clock,
  ArrowSquareOut // Icon mới cho link
} from '@phosphor-icons/react';

// --- HELPERS ---
const formatDateVN = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Hàm lấy Link dịch vụ dựa trên Type
const getServiceLink = (service) => {
    if (!service || !service.slug) return "#";
    const typeMap = {
        'EXPERIENCE': 'experience',
        'DINING': 'dining',
        'DISCOVER': 'discover'
    };
    // Default về experience nếu không match
    const path = typeMap[service.type] || 'experience'; 
    return `/${path}/${service.slug}`;
};

// --- CALENDAR COMPONENT (Giữ nguyên) ---
const CalendarSelector = ({ onClose, onDateSelect, initialStartDate, initialEndDate, validFrom, validTo, bookedRanges = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const today = new Date(); today.setHours(0,0,0,0);
  const minDate = validFrom ? new Date(validFrom) : today;
  const maxDate = validTo ? new Date(validTo) : null;
  const effectiveMinDate = minDate < today ? today : minDate;

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0); // Chuẩn hóa giờ để tránh lỗi múi giờ
    return d.getTime();
  };

  const isDateDisabled = (dateToCheck) => {
    const checkTime = normalizeDate(dateToCheck);
    // 1. Kiểm tra hạn Combo
    if (dateToCheck < effectiveMinDate) return true;
    if (maxDate && dateToCheck > maxDate) return true;
    // 2. Kiểm tra lịch bận (QUAN TRỌNG)
    return bookedRanges.some(range => {
      const start = normalizeDate(range.startDate);
      const end = normalizeDate(range.endDate);
      return checkTime >= start && checkTime < end;
    });
  };

  const handleDayClick = (day) => {
    if (isDateDisabled(day)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      const sTime = normalizeDate(startDate);
      const eTime = normalizeDate(day);
      const lower = Math.min(sTime, eTime);
      const upper = Math.max(sTime, eTime);

      const hasBlocked = bookedRanges.some(range => {
        const rs = normalizeDate(range.startDate);
        const re = normalizeDate(range.endDate);
        return (rs < upper && re > lower);
      });

      if (hasBlocked) {
        showError("Khoảng thời gian này đã có ngày hết phòng!");
        return;
      }

      if (day > startDate) setEndDate(day);
      else { setStartDate(day); setEndDate(null); }
    }
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const monthName = monthDate.toLocaleString('default', { month: 'long' });

    let days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`empty-${i}`} />);
    
    for (let i = 1; i <= daysInMonth; i++) {
       const date = new Date(year, month, i, 0, 0, 0, 0);
       const isDisabled = isDateDisabled(date);
       const isStart = startDate && date.getTime() === startDate.getTime();
       const isEnd = endDate && date.getTime() === endDate.getTime();
       const isInRange = startDate && endDate && date > startDate && date < endDate;
       const isSelectedOrRange = isStart || isEnd || isInRange;

       days.push(
         <div 
           key={i} 
           onClick={() => !isDisabled && handleDayClick(date)}
           className={`
             h-10 w-10 flex items-center justify-center text-xs font-medium rounded-full transition-all
             ${isDisabled 
                ? 'text-neutral-300 cursor-not-allowed bg-neutral-50 line-through' 
                : 'text-neutral-600 hover:bg-stone-100 cursor-pointer'}
             ${isSelectedOrRange ? '!bg-black !text-white hover:!bg-neutral-800' : ''}
           `}
         >
            {i}
         </div>
       );
    }
    return (
      <div className="flex-1 min-w-[280px]">
         <div className="text-center mb-6 font-serif italic text-lg text-neutral-800 capitalize">{monthName} {year}</div>
         <div className="grid grid-cols-7 mb-4 text-[10px] font-bold tracking-widest text-neutral-400 text-center">
            <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center">{days}</div>
      </div>
    );
  };

  const nextMonthDate = new Date(currentDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  return (
    <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl p-8 z-60 w-full md:w-[700px] border border-neutral-100 animate-fadeIn text-left">
      <div className="flex justify-between items-center mb-4">
         <button type="button" onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }} className="text-neutral-400 hover:text-black"><CaretLeft size={24} /></button>
         <button type="button" onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }} className="text-neutral-400 hover:text-black"><CaretRight size={24} /></button>
      </div>
      <div className="flex gap-12 overflow-x-auto pb-4">
         {renderMonth(currentDate)}
         <div className="hidden md:block border-l border-neutral-100 pl-12">{renderMonth(nextMonthDate)}</div>
      </div>
      <div className="flex justify-end pt-6 border-t border-neutral-100 mt-4 gap-6 items-center">
         <span className="text-xs text-neutral-400 italic font-serif">{startDate ? formatDateVN(startDate) : "Ngày đến"} - {endDate ? formatDateVN(endDate) : "Ngày đi"}</span>
         <button onClick={(e) => { e.preventDefault(); if(startDate && endDate) { onDateSelect(startDate, endDate); onClose(); } else showError("Vui lòng chọn đủ ngày."); }} className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3 hover:bg-neutral-800 transition-colors">Xác nhận</button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const OfferDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedRanges, setBookedRanges] = useState([]); // State lưu lịch bận
  
  const [showBooking, setShowBooking] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/offers/slug/${slug}`);
        if (res.data.success) {
          setOffer(res.data.data);
          fetchAvailability(res.data.data._id); // Gọi lấy lịch bận sau khi có ID Combo
        }
      } catch (error) {
        console.error("Lỗi tải offer:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [slug]);

  const fetchAvailability = async (offerId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/offers/availability/${offerId}`);
      if (res.data.success) {
        setBookedRanges(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch trống combo:", error);
    }
  };

  const handleOpenBooking = () => setShowBooking(true);
  const handleCloseBooking = () => { setShowBooking(false); setActivePopup(null); };

  const handleAddToCart = async (e) => {
      e.preventDefault();
      if(!checkInDate || !checkOutDate) return showError("Vui lòng chọn ngày nhận và trả phòng!");
      await addToCart({
          type: 'OFFER', itemId: offer._id, title: offer.title, image: offer.thumbnail, price: offer.combo_price, checkIn: checkInDate, checkOut: checkOutDate, quantity: 1
      });
      setShowBooking(false); setIsCartOpen(false); showSuccess("Đã thêm Combo vào giỏ hàng!");
  };

  const handleBookNow = (e) => {
      e.preventDefault();
      if(!checkInDate || !checkOutDate) return showError("Vui lòng chọn ngày nhận và trả phòng!");
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const directItem = {
          type: 'OFFER', itemId: offer._id, title: offer.title, image: offer.thumbnail, price: offer.combo_price, checkIn: checkInDate, checkOut: checkOutDate, nights: nights, totalPrice: offer.combo_price * 1, quantity: 1
      };
      setShowBooking(false); navigate('/checkout', { state: { directBooking: directItem } });
  };

  if (loading) return <MainLayout><div className="h-screen flex items-center justify-center text-xs font-bold tracking-widest uppercase animate-pulse">Đang tải dữ liệu...</div></MainLayout>;
  if (!offer) return <MainLayout><div className="h-screen flex items-center justify-center font-serif">Không tìm thấy ưu đãi.</div></MainLayout>;

  const discountPercent = offer.original_price > 0 ? Math.round(((offer.original_price - offer.combo_price) / offer.original_price) * 100) : 0;

  return (
    <MainLayout>
        <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-500 ${showBooking ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={handleCloseBooking}></div>

        {/* --- BOOKING SLIDE-DOWN FORM --- */}
        <div className={`fixed top-0 left-0 w-full bg-white z-50 shadow-2xl transition-transform duration-700 cubic-bezier(0.77, 0, 0.175, 1) ${showBooking ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="container mx-auto px-6 py-8 md:py-10 relative">
                <button onClick={handleCloseBooking} className="absolute top-6 right-6 text-neutral-400 hover:text-black"><X size={32} weight="light" /></button>
                <h3 className="text-center font-serif text-2xl uppercase tracking-widest mb-2 text-neutral-900">Đặt Combo Ưu Đãi</h3>
                <p className="text-center text-sm text-neutral-500 italic mb-8">{offer.title}</p>
                <form className="flex flex-col xl:flex-row items-end justify-center gap-6 md:gap-8 w-full">
                    <div className="relative w-full md:w-[400px] xl:flex-1">
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">Thời gian lưu trú</label>
                        <div onClick={() => setActivePopup(activePopup === 'calendar' ? null : 'calendar')} className={`bg-stone-50 p-3 flex items-center justify-between h-[56px] cursor-pointer hover:bg-stone-100 border-b border-neutral-300 ${activePopup === 'calendar' ? 'ring-1 ring-black bg-white' : ''}`}>
                            <span className="text-lg font-serif italic text-neutral-800">{checkInDate && checkOutDate ? `${formatDateVN(checkInDate)} - ${formatDateVN(checkOutDate)}` : "Chọn ngày..."}</span>
                            <CalendarBlank size={24} className="text-neutral-400" />
                        </div>
                        {activePopup === 'calendar' && <CalendarSelector onClose={() => setActivePopup(null)} onDateSelect={(s, e) => { setCheckInDate(s); setCheckOutDate(e); }} initialStartDate={checkInDate} initialEndDate={checkOutDate} validFrom={offer.valid_from} validTo={offer.valid_to} bookedRanges={bookedRanges}/>}
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                        <button type="button" onClick={handleBookNow} className="flex items-center justify-center gap-3 h-[56px] px-10 bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer hover:bg-black transition-all w-full md:w-auto min-w-[220px]"><CreditCard size={20} weight="bold" /> Đặt ngay</button>
                        <button type="button" onClick={handleAddToCart} className="group flex items-center justify-center gap-3 h-[56px] px-8 border border-neutral-300 bg-white text-neutral-900 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-50 cursor-pointer transition-all w-full md:w-auto min-w-[200px]"><ShoppingCartSimple size={20} weight="bold" className="text-neutral-500 group-hover:text-neutral-900" /> Thêm vào giỏ</button>
                    </div>
                </form>
            </div>
        </div>

        {/* --- HERO SECTION --- */}
        <div className="relative h-[80vh] w-full overflow-hidden">
            <img src={offer.banner || offer.thumbnail} alt={offer.title} className="w-full h-full object-cover animate-scale-slow"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-16 px-6 z-10 text-center">
                <div className="flex items-center gap-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/80 mb-4 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                    <Tag size={16} weight="fill" className="text-amber-400"/> Gói ưu đãi đặc biệt
                </div>
                <h1 className="text-3xl md:text-6xl font-playfair italic font-semibold text-white uppercase tracking-[0.1em] mb-6 drop-shadow-xl max-w-5xl leading-tight">{offer.title}</h1>
                {offer.valid_to && <p className="text-white/80 font-serif italic text-lg mb-8">Áp dụng đến: {formatDateVN(offer.valid_to)}</p>}
                <button onClick={handleOpenBooking} className="group relative overflow-hidden border border-white/30 bg-white/10 backdrop-blur-sm text-white px-10 py-4 transition-all cursor-pointer duration-300 hover:bg-white hover:text-black"><span className="text-xs font-bold uppercase tracking-[0.25em]">Đặt gói combo này</span></button>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="bg-white py-20 md:py-28">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-8">
                        {/* DESCRIPTION */}
                        <div className="mb-16">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-8 text-neutral-400">Giới thiệu gói</h3>
                            <div className="text-neutral-800 leading-loose text-lg font-light font-serif whitespace-pre-line text-justify first-letter:text-5xl first-letter:font-playfair first-letter:mr-1 first-letter:float-left">
                                {offer.description}
                            </div>
                        </div>

                        {/* Valid Date Info */}
                        <div className="bg-stone-50 border border-stone-200 p-8 flex items-start gap-4 rounded-sm mb-12">
                            <Clock size={24} className="text-neutral-400 shrink-0 mt-1"/>
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-900 mb-2">Thời gian áp dụng</h4>
                                <p className="text-neutral-600 font-serif italic">Từ <span className="text-black font-medium">{formatDateVN(offer.valid_from)}</span> đến <span className="text-black font-medium">{formatDateVN(offer.valid_to)}</span></p>
                            </div>
                        </div>

                        {/* LIST: PHÒNG ĐI KÈM (CLICK ĐƯỢC - NEW WINDOW) */}
                        {offer.included_rooms && offer.included_rooms.length > 0 && (
                            <div className="mb-16 pt-12 border-t border-neutral-100">
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-neutral-400 flex items-center gap-2">
                                    <Bed size={18} /> Phòng nghỉ
                                </h3>
                                <div className="space-y-6">
                                    {offer.included_rooms.map((item, idx) => (
                                        <Link 
                                            key={idx}
                                            to={`/rooms/${item.room_id?.slug}`} // Link đến chi tiết phòng
                                            target="_blank" // Mở tab mới
                                            className="flex flex-col md:flex-row gap-6 items-stretch p-4 border border-neutral-100 hover:border-black/20 hover:shadow-lg transition-all duration-300 group bg-white cursor-pointer relative"
                                        >
                                            {/* Icon Link góc phải */}
                                            <div className="absolute top-4 right-4 text-neutral-300 group-hover:text-black transition-colors">
                                                <ArrowSquareOut size={20} />
                                            </div>

                                            <div className="w-full md:w-48 h-48 md:h-auto shrink-0 overflow-hidden">
                                                 {item.room_id?.hero?.image ? (
                                                    <img src={item.room_id.hero.image} alt="Room" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300"><Bed size={32}/></div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col justify-center py-2 pr-8">
                                                <h4 className="font-playfair text-xl md:text-2xl text-neutral-900 italic mb-2 group-hover:text-amber-800 transition-colors decoration-clone">
                                                    {item.room_id?.title || "Phòng nghỉ cao cấp"}
                                                </h4>
                                                {item.room_id?.base_price && (
                                                    <p className="text-sm text-neutral-500 font-serif">
                                                        Giá niêm yết: <span className="line-through decoration-neutral-300 decoration-1">{formatPrice(item.room_id.base_price)}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LIST: DỊCH VỤ ĐI KÈM (LAYOUT MỚI - CLICK ĐƯỢC - NEW WINDOW) */}
                        {offer.included_services && offer.included_services.length > 0 && (
                            <div className="mb-12 pt-12 border-t border-neutral-100">
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-neutral-400 flex items-center gap-2">
                                    <Sparkle size={18} /> Dịch vụ & Trải nghiệm đi kèm
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {offer.included_services.map((svc, idx) => (
                                        <Link 
                                            key={idx}
                                            to={getServiceLink(svc.service_id)}
                                            target="_blank"
                                            className="group flex flex-col bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                                        >
                                            {/* Icon Link Out */}
                                            <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-400 group-hover:bg-black group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                <ArrowSquareOut size={16} />
                                            </div>

                                            {/* Ảnh Dịch Vụ */}
                                            <div className="h-48 overflow-hidden relative">
                                                {svc.service_id?.gallery && svc.service_id.gallery.length > 0 ? (
                                                    <img 
                                                        src={svc.service_id.gallery[0]} 
                                                        alt={svc.service_id.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-neutral-300">
                                                        <Sparkle size={32} weight="fill"/>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Nội dung chi tiết */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <h5 className="font-playfair text-lg text-neutral-900 font-bold mb-1 group-hover:text-amber-700 transition-colors line-clamp-1">
                                                    {svc.service_id?.title || "Dịch vụ"}
                                                </h5>
                                                
                                                {/* Hiển thị Tên gói đã lưu trong DB Offer */}
                                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 line-clamp-1">
                                                    Gói: {svc.package_title}
                                                </p>

                                                <div className="mt-auto pt-4 border-t border-dashed border-neutral-200">
                                                    <div className="flex items-center justify-between">
                                                        {/* CỘT TRÁI: LABEL (Vd: ADULTS (6+)) */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                                                            <span className="text-[11px] font-bold uppercase text-neutral-600 tracking-wider">
                                                                {svc.label || "Tiêu chuẩn"}
                                                            </span>
                                                        </div>

                                                        {/* CỘT PHẢI: GIÁ & TRẠNG THÁI */}
                                                        <div className="flex flex-col items-end">
                                                            {/* Giá gốc bị gạch ngang */}
                                                            {svc.price > 0 ? (
                                                                <span className="text-xs font-serif text-neutral-400 line-through decoration-neutral-300">
                                                                    {formatPrice(svc.price)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs italic text-neutral-400">
                                                                    Theo thời giá
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Note */}
                                                    {svc.note && (
                                                        <div className="mt-3 flex items-start gap-2 text-[11px] text-neutral-500 italic bg-stone-50 p-2 rounded-sm">
                                                            <CheckCircle size={14} className="text-green-600 shrink-0 mt-[1px]" weight="fill"/>
                                                            <span>{svc.note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: STICKY PRICE CARD */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="bg-white border border-neutral-200 p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                <div className="text-center mb-8 relative z-10">
                                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-4">Trọn gói ưu đãi</p>
                                    <div className="flex flex-col items-center justify-center">
                                        {offer.original_price > offer.combo_price && (
                                            <span className="text-neutral-400 line-through text-lg font-serif decoration-neutral-300">{formatPrice(offer.original_price)}</span>
                                        )}
                                        <span className="text-4xl md:text-5xl font-playfair italic text-amber-700 font-medium my-2">{formatPrice(offer.combo_price)}</span>
                                        {discountPercent > 0 && <span className="bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mt-2">Tiết kiệm {discountPercent}%</span>}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 text-sm text-neutral-600 font-light border-y border-neutral-100 py-6">
                                    <div className="flex justify-between"><span>Số lượng phòng:</span><span className="font-bold text-black">{offer.included_rooms?.length || 0}</span></div>
                                    <div className="flex justify-between"><span>Dịch vụ đi kèm:</span><span className="font-bold text-black">{offer.included_services?.length || 0}</span></div>
                                </div>

                                {offer.is_available ? (
                                    <button onClick={handleOpenBooking} className="w-full bg-neutral-900 text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">Đặt ngay combo này</button>
                                ) : (
                                    <div className="w-full bg-neutral-100 text-neutral-400 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-center cursor-not-allowed border border-neutral-200">Tạm ngưng phục vụ</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- BOTTOM CTA BAR --- */}
        <div className="bg-neutral-900 py-16">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left text-white">
                        <h4 className="font-playfair text-2xl italic mb-2">Bạn đã sẵn sàng cho kỳ nghỉ?</h4>
                        <p className="text-neutral-400 text-sm font-light">Đừng bỏ lỡ ưu đãi giới hạn này.</p>
                    </div>
                    <button onClick={handleOpenBooking} className="group bg-white text-black px-12 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-3">Đặt Ngay <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform"/></button>
                </div>
            </div>
        </div>
    </MainLayout>
  );
};

export default OfferDetails;