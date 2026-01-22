import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../context/CartContext';  
import { 
    ArrowLeft, CreditCard, User, Note, Envelope, Phone, 
    CheckCircle, Receipt, HouseLine, Bed, Tag, X, ShieldCheck, Ticket, Wallet, Bank 
} from '@phosphor-icons/react';
import axios from 'axios';
import { showError, showSuccess } from '../utils/toast';

// --- BIẾN TĨNH: CHÍNH SÁCH KHÁCH SẠN (Giữ nguyên) ---
const POLICIES = [
    {
      title: "THỜI GIAN NHẬN & TRẢ PHÒNG",
      content: "Giờ nhận phòng: 12:00 PM | Giờ trả phòng: 12:00 PM",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "NHẬN PHÒNG SỚM VÀ TRẢ PHÒNG MUỘN",
      content: "Để đảm bảo chất lượng phòng nghỉ luôn ở mức hoàn hảo nhất, Quý khách vui lòng nhận phòng từ 12:00 PM. Trong trường hợp đến sớm, Quý khách có thể thư giãn tại sảnh chờ hoặc gửi hành lý tại quầy Lễ tân. Đối với việc trả phòng muộn sau 12:00 PM, hệ thống sẽ tự động tính phí tương đương một đêm nghỉ tiếp theo.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
    },
    {
      title: "PHƯƠNG THỨC THANH TOÁN",
      content: "Mọi chi phí dịch vụ, ẩm thực và giải trí trong kỳ nghỉ sẽ được tổng hợp vào hóa đơn phòng. Quý khách vui lòng thanh toán tại quầy Lễ tân khi làm thủ tục trả phòng. Chúng tôi chấp nhận Tiền mặt, Chuyển khoản và các loại thẻ tín dụng quốc tế (Visa, Master, JCB...).",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      )
    },
    {
      title: "HỖ TRỢ & XỬ LÝ SỰ CỐ",
      content: "Đội ngũ Chăm sóc Khách hàng luôn sẵn sàng phục vụ 24/7. Nếu có bất kỳ thắc mắc hoặc sự cố cần giải quyết khẩn cấp, Quý khách vui lòng liên hệ trực tiếp qua Hotline: 0942.819.936 để được hỗ trợ kịp thời.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
        </svg>
      )
    }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart} = useCart();
  
  // --- XỬ LÝ DỮ LIỆU ĐẦU VÀO ---
  const directBookingItem = location.state?.directBooking;
  const checkoutItems = directBookingItem ? [directBookingItem] : (cart?.items || []);
  
  // Phân loại items
  const newBookingItems = checkoutItems.filter(item => !item.bookingCode);
  const addOnItems = checkoutItems.filter(item => item.bookingCode);

  // Tính toán tổng tiền
  const newItemsTotal = newBookingItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const addOnTotal = addOnItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const grandTotal = newItemsTotal + addOnTotal;

  const mustShowForm = newBookingItems.length > 0;

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', note: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  useEffect(() => {
    if (!mustShowForm) {
        setPaymentMethod('CASH');
    }
  }, [mustShowForm]);

    useEffect(() => {
        // Nếu không có sản phẩm nào để thanh toán thì quay về trang chủ
        if (checkoutItems.length === 0) {
        navigate('/'); 
        }
    }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  
  const formatDateShort = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput); 
    if (isNaN(date.getTime())) return ''; 
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    return `${day}/${month}`;
  };

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).toLowerCase());

  // --- LOGIC SUBMIT (CẬP NHẬT CHO OFFER) ---
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Form
    if (!agreedToTerms) {
        showError("Vui lòng đồng ý với Chính sách & Điều khoản của khách sạn.");
        return;
    }

    if (mustShowForm) {
        if(!formData.fullName || !formData.email || !formData.phone) {
            showError("Vui lòng điền đầy đủ thông tin khách hàng.");
            return;
        }
        if (!validateEmail(formData.email)) {
            showError("Địa chỉ Email không hợp lệ.");
            return;
        }
    }

    setLoading(true);
    try {
        const promises = [];
        const hasBooking = newBookingItems.length > 0;
        const hasService = addOnItems.length > 0;
        
        // Biến để lưu mã đơn hàng dùng cho việc chuyển hướng
        let finalBookingCode = null; 

        // --- XỬ LÝ ĐẶT PHÒNG MỚI ---
        if (hasBooking) {
            const stayItems = newBookingItems.filter(item => item.type === 'ROOM' || item.type === 'OFFER');
            const serviceItems = newBookingItems.filter(item => item.type !== 'ROOM' && item.type !== 'OFFER');

            const bookingPayload = {
                customer_info: {
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    special_requests: formData.note
                },
                booked_rooms: stayItems.map(item => ({
                    room_id: item.type === 'ROOM' ? item.itemId : null,
                    offer_id: item.type === 'OFFER' ? item.itemId : null,
                    is_combo: item.type === 'OFFER',
                    room_title: item.title,
                    room_thumbnail: item.image,
                    check_in: item.checkIn,
                    check_out: item.checkOut,
                    price_per_night: item.price,
                    total_nights: item.nights,
                    total_room_price: item.totalPrice,
                    primary_guest_name: formData.fullName
                })),
                booked_services: serviceItems.map(item => ({
                    service_id: item.itemId,
                    service_title: item.title,
                    service_thumbnail: item.image,
                    selected_package: item.packageTitle, 
                    selected_rate_label: item.rateLabel,
                    unit_price: item.price,
                    total_service_price: item.totalPrice,
                    service_dates: item.dates || [] 
                })),
                payment_method: paymentMethod,
                final_total: newItemsTotal
            };
            
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${API_URL}/api/v1/invoices/create`, bookingPayload);

            // [LOGIC VNPAY]
            if (res.data.isRedirect && res.data.paymentUrl) {
                window.location.href = res.data.paymentUrl;
                return; 
            }
            
            // [LẤY MÃ ĐỂ REDIRECT] Nếu là CASH
            if (res.data.success) {
                finalBookingCode = res.data.bookingCode;
            }
        }

        // --- XỬ LÝ THÊM DỊCH VỤ (ADD-ON) ---
        if (hasService) {
            const uniqueCodes = [...new Set(addOnItems.map(item => item.bookingCode))];
            
            // Nếu chỉ mua thêm dịch vụ (không đặt phòng mới), lấy mã code từ item đầu tiên để redirect
            if (!finalBookingCode && uniqueCodes.length > 0) {
                finalBookingCode = uniqueCodes[0]; 
            }

            uniqueCodes.forEach(code => {
                const itemsForThisCode = addOnItems.filter(i => i.bookingCode === code);
                const subTotal = itemsForThisCode.reduce((sum, i) => sum + i.totalPrice, 0);

                const newServices = itemsForThisCode.map(item => ({
                    service_id: item.itemId,
                    service_title: item.title,
                    service_type: item.type,
                    service_thumbnail: item.image,
                    selected_rate_label: item.rateLabel,
                    selected_package: item.packageTitle,
                    unit_price: item.price, 
                    total_service_price: item.totalPrice,
                    service_dates: item.dates || [],
                    allocated_room_title: item.roomTitle
                }));

                const API_URL = import.meta.env.VITE_API_URL;
                promises.push(
                    axios.post(`${API_URL}/api/v1/invoices/add-services`, {
                        booking_code: code,
                        new_services: newServices,
                        additional_total: subTotal
                    }) // <-- Đóng Object data tại đây
                    .then(() => {
                        showSuccess("Đã thêm dịch vụ vào hóa đơn thành công."); 
                    })
                );
            });
        }

        // Chờ tất cả request hoàn tất
        await Promise.all(promises);
        
        if (finalBookingCode) {
            navigate(`/checkout-success?code=${finalBookingCode}&status=success`, { 
                state: { 
                    shouldClearCart: !directBookingItem // Gửi tín hiệu cần xóa giỏ hàng
                } 
            });
        } else {
            navigate('/');
        }

    } catch (error) {
        console.error("Checkout Error:", error);
        showError(error.response?.data?.message || "Hệ thống đang bận, vui lòng thử lại sau.");
    } finally {
        setLoading(false);
    }
  };

  // --- UI CHÍNH ---
  return (
      <div className="bg-neutral-50/50 min-h-screen py-12 lg:py-24 font-sans">
        <form onSubmit={handleCheckoutSubmit} className="container mx-auto px-4 max-w-6xl animate-fadeIn">
             
             {/* HEADER */}
             <div className="mb-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-b border-neutral-200 pb-6">
                 <button type="button" onClick={() => navigate(-1)} className="group text-neutral-500 hover:text-black transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
                </button>
                <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-neutral-900">
                    Thanh Toán & Xác Nhận
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative">
                 
                 {/* === CỘT TRÁI: FORM === */}
                 <div className="lg:col-span-7 space-y-8">
                    {/* (Giữ nguyên phần Form nhập thông tin User) */}
                    {mustShowForm ? (
                        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-50">
                                <User size={24} weight="duotone" className="text-neutral-400"/>
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-neutral-900">Thông tin người đặt</h2>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Bắt buộc</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="relative">
                                    <label className="checkout-label">Họ và tên <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="checkout-input pl-12" placeholder="VD: Nguyen Van A" />
                                        <User size={18} className="checkout-icon group-focus-within:text-black" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="checkout-label">Email <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} onBlur={(e) => {if(e.target.value && !validateEmail(e.target.value)) showError("Email không hợp lệ")}} required className="checkout-input pl-12" placeholder="email@example.com" />
                                            <Envelope size={18} className="checkout-icon group-focus-within:text-black" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="checkout-label">Số điện thoại <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="checkout-input pl-12" placeholder="09xxxxxxxx" />
                                            <Phone size={18} className="checkout-icon group-focus-within:text-black" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="checkout-label">Ghi chú đặc biệt</label>
                                    <div className="relative group">
                                        <textarea name="note" value={formData.note} onChange={handleInputChange} rows="3" className="checkout-input pl-12 py-3 resize-none" placeholder="Yêu cầu về phòng, giờ check-in..."></textarea>
                                        <Note size={18} className="checkout-icon top-3 group-focus-within:text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl border border-neutral-100 text-center shadow-sm">
                            <p className="text-neutral-500 font-light italic">
                                "Chúng tôi sẽ cập nhật dịch vụ vào hoá đơn tương ứng của Quý khách."
                            </p>
                        </div>
                    )}

                     {/* Payment Info & Terms (Giữ nguyên) */}
                     <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard size={24} weight="duotone" className="text-neutral-600" />
                            <h3 className="text-lg font-serif font-bold text-neutral-900">Phương thức thanh toán</h3>
                        </div>

                        {/* NẾU LÀ DỊCH VỤ (KHÔNG HIỆN FORM) -> HIỆN THÔNG BÁO */}
                        {!mustShowForm ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <Receipt size={24} className="text-amber-600 mt-1 shrink-0" weight="fill" />
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm uppercase mb-1">Thanh toán khi trả phòng</h4>
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        Khoản phí dịch vụ này sẽ được thêm vào hóa đơn đặt phòng gốc. 
                                        Vui lòng thanh toán tại quầy Lễ tân khi làm thủ tục trả phòng.
                                    </p>
                                </div>
                            </div>
                        ) : (
                        <div className="space-y-3">
                            {/* Option 1: Tiền mặt */}
                            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center">
                                        <HouseLine size={20} className="text-neutral-600"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-neutral-900">Thanh toán tại khách sạn</p>
                                        <p className="text-xs text-neutral-500">Trả tiền mặt hoặc dùng thẻ khi check-in tại quầy lễ tân</p>
                                    </div>
                                </div>
                                <input type="radio" name="payment" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="accent-black w-5 h-5"/>
                            </label>

                            {/* Option 2: VNPay */}
                            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center p-1">
                                        {/* Logo VNPay (hoặc dùng Icon) */}
                                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" className="w-full object-contain"/> 
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-neutral-900">VNPay QR / ATM / Visa</p>
                                        <p className="text-xs text-neutral-500">Thanh toán online an toàn, tiện lợi</p>
                                    </div>
                                </div>
                                <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="accent-blue-600 w-5 h-5"/>
                            </label>

                            {/* Có thể thêm MoMo tương tự */}
                        </div>
                        )}
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-white transition-colors cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                        <div className={`mt-0.5 w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${agreedToTerms ? 'bg-black border-black' : 'border-neutral-300 bg-white'}`}>
                             {agreedToTerms && <CheckCircle size={14} weight="fill" className="text-white"/>}
                        </div>
                        <p className="text-sm text-neutral-600 select-none leading-relaxed">
                            Tôi xác nhận đã đọc và đồng ý với <span onClick={(e) => { e.stopPropagation(); setShowPolicyModal(true); }} className="font-bold text-black underline hover:text-neutral-600 cursor-pointer">Chính sách & Quy định</span> của khách sạn.
                        </p>
                    </div>
                 </div>

                {/* === CỘT PHẢI: BILL SUMMARY (ĐÃ CẬP NHẬT CHO OFFER) === */}
                <div className="lg:col-span-5">
                    <div className="sticky top-28 bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-100">
                        <h2 className="text-2xl font-serif font-bold mb-6 text-neutral-900 border-b border-neutral-100 pb-4">Chi tiết đơn hàng</h2>

                        <div className="space-y-6 mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                            {checkoutItems.map((item, idx) => (
                                 <div key={idx} className="flex gap-5 py-4 border-b border-neutral-100 last:border-0 group">
                                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-200 relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        
                                        {/* [LOGIC BADGE MỚI] */}
                                        {item.type === 'ROOM' && <div className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PHÒNG</div>}
                                        {item.type === 'OFFER' && <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">COMBO</div>}
                                        {item.bookingCode && <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">DỊCH VỤ</div>}
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold font-playfair text-neutral-900 line-clamp-2">{item.title}</h3>
                                            
                                            {/* [LOGIC HIỂN THỊ CHI TIẾT] Gom Offer và Room hiển thị giống nhau */}
                                            {(item.type === 'ROOM' || item.type === 'OFFER') ? (
                                                <div className="flex flex-col gap-1 text-xs text-neutral-500 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Bed size={14}/> 
                                                        <span>{item.nights} đêm</span>
                                                        <span className="mx-1">•</span>
                                                        <span>{formatDateShort(item.checkIn)} - {formatDateShort(item.checkOut)}</span>
                                                    </div>
                                                    {item.type === 'OFFER' && item.quantity > 1 && (
                                                        <div className="text-amber-700 font-bold">Số lượng: {item.quantity} gói</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-neutral-500 mt-1 space-y-1">
                                                    {item.dates && item.dates.length > 0 && (
                                                        <p><span className="font-bold text-neutral-500">Ngày: </span>{item.dates.map(d => formatDateShort(d)).join(', ')}</p>
                                                    )}
                                                    {(item.packageTitle || item.rateLabel) && (
                                                        <p className="flex items-center gap-1">
                                                            <Tag size={12} weight="fill" className="text-neutral-400"/>
                                                            <span className="uppercase tracking-wider text-[10px]">
                                                                {item.packageTitle} {item.rateLabel ? `- ${item.rateLabel}` : ''}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {item.bookingCode && (
                                                        <p className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded w-fit text-neutral-500 font-mono">
                                                            Mã: #{item.bookingCode.replace('FS-', '')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-neutral-900 text-right">{formatPrice(item.totalPrice)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-neutral-50 p-6 rounded-xl space-y-3 mb-6">
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Tạm tính</span>
                                <span>{formatPrice(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Phí dịch vụ & Thuế (10%)</span>
                                <span className="italic">(Đã bao gồm)</span>
                            </div>
                            <div className="flex justify-between items-end pt-3 border-t border-neutral-200 mt-2">
                                <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">Tổng cộng</span>
                                <span className="text-2xl font-serif font-bold text-neutral-900">{formatPrice(grandTotal)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A1A1A] text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-black cursor-pointer transition-all disabled:bg-neutral-400 shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2"
                        >
                            {loading 
                                ? "Đang xử lý..." 
                                : (!mustShowForm ? "Xác nhận thêm dịch vụ" : "Xác nhận & Thanh toán")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </form>

        {/* MODAL CHÍNH SÁCH (Giữ nguyên) */}
        {showPolicyModal && (
            <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPolicyModal(false)}></div>
                <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl relative flex flex-col animate-fadeIn overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={24} weight="duotone" className="text-neutral-800" />
                            <h3 className="text-lg font-serif font-bold text-neutral-900">Chính sách & Quy định</h3>
                        </div>
                        <button onClick={() => setShowPolicyModal(false)} className="text-neutral-400 hover:text-black p-2 hover:bg-white rounded-full transition-all">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                        <div className="space-y-8">
                            {POLICIES.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">{item.title}</h4>
                                        <p className="text-sm text-neutral-600 leading-relaxed font-light text-justify">{item.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                        <button 
                            onClick={() => { setAgreedToTerms(true); setShowPolicyModal(false); }}
                            className="bg-black text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                        >
                            Tôi Đồng Ý
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
  );
};

export default CheckoutPage;