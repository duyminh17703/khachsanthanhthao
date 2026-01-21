import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from '../layout/MainLayout';
import { 
    MagnifyingGlass, CalendarCheck, User, 
    Bed, Receipt, CheckCircle, Warning, Spinner, Envelope, Phone,
    Clock, Tag, Sparkle, ArrowRight, Printer, Download, MapPin, CreditCard
} from '@phosphor-icons/react';

const Find = () => {
  const [code, setCode] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setInvoice(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${API_URL}/api/v1/invoices/search/${code.trim()}`);
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không tìm thấy thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepayment = async () => {
    try {
        // Gọi API tạo lại link thanh toán
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.post(`${API_URL}/api/v1/invoices/create_payment_url`, {
            booking_code: invoice.booking_code
        });
        
        if (res.data.success) {
            // Chuyển hướng sang VNPay
            window.location.href = res.data.paymentUrl;
        }
    } catch (err) {
        alert(err.response?.data?.message || "Lỗi tạo link thanh toán, vui lòng thử lại sau.");
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '...';

  const getStatusStyle = (status) => {
    const map = {
        'CHỜ XÁC NHẬN': 'bg-amber-50 text-amber-700 border-amber-200',
        'ĐÃ XÁC NHẬN-CHỜ CHECKIN': 'bg-blue-50 text-blue-700 border-blue-200',
        'ĐÃ CHECKIN-CHỜ THANH TOÁN': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'ĐÃ THANH TOÁN': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'ĐÃ HUỶ': 'bg-stone-100 text-stone-500 border-stone-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F9F8F6] py-40 px-4 md:px-8">
        
        {/* --- SEARCH HEADER --- */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-neutral-500 font-semibold tracking-widest uppercase text-lg mb-10 italic">
                Nhập mã đặt phòng được gửi trong email xác nhận
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
                <input 
                    type="text" value={code} onChange={(e) => setCode(e.target.value)}
                    placeholder="Mã booking (FS-XXXXX)..." 
                    className="w-full bg-white border border-neutral-200 rounded-full px-8 py-5 outline-none shadow-sm focus:shadow-xl focus:border-neutral-900 transition-all font-mono tracking-widest text-lg uppercase"
                />
                <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-neutral-900 text-white px-8 rounded-full cursor-pointer hover:bg-black transition-all flex items-center gap-2">
                    {loading ? <Spinner className="animate-spin" /> : <MagnifyingGlass size={20} weight="bold" />}
                    <span className="text-[11px] font-bold uppercase tracking-tighter">Tra cứu</span>
                </button>
            </form>
            {error && <p className="mt-4 text-red-500 text-sm italic"> <Warning className="inline mr-1"/> {error}</p>}
        </div>

        {invoice && (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            
            {/* --- TOP BAR: STATUS & ACTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 ${getStatusStyle(invoice.status)}`}>
                            {invoice.status}
                        </div>
                    </div>
                    <h2 className="text-4xl font-serif font-bold tracking-tighter">#{invoice.booking_code}</h2>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 border border-neutral-300 rounded-full hover:bg-white transition-all text-neutral-600"><Printer size={20}/></button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-900 text-neutral-900 rounded-full text-[11px] font-bold cursor-pointer uppercase hover:bg-neutral-900 hover:text-white transition-all">
                        <Download size={18}/> Tải hoá đơn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* --- LEFT: MAIN CONTENT (8 COLS) --- */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* SECTION: PHÒNG NGHỈ */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex items-center gap-2">
                                <Bed size={18}/> Thông tin lưu trú
                            </h3>
                            <div className="h-1px flex-1 bg-neutral-200"></div>
                        </div>

                        <div className="space-y-6">
                            {invoice.booked_rooms.map((room, idx) => (
                                <div key={idx} className="bg-white group overflow-hidden border border-neutral-100 hover:border-neutral-300 transition-all rounded-2xl flex flex-col md:flex-row">
                                    <div className="md:w-72 h-56 md:h-auto overflow-hidden relative">
                                        <img src={room.room_thumbnail || room.room_id?.hero?.image} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                                        {room.is_combo && (
                                            <div className="absolute top-4 left-4 bg-amber-600 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">Gói Ưu Đãi</div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-2xl font-serif italic text-neutral-900">{room.room_title}</h4>
                                                <div className={`text-[10px] font-bold ${room.status === 'HUỶ' ? 'text-red-500' : 'text-emerald-600'}`}>{room.status}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="border-l-2 border-neutral-100 pl-4">
                                                    <p className="text-[9px] uppercase font-bold text-neutral-400 mb-1">Ngày đặt</p>
                                                    <p className="text-sm font-medium">{formatDate(room.check_in)}</p>
                                                </div>
                                                <div className="border-l-2 border-neutral-100 pl-4">
                                                    <p className="text-[9px] uppercase font-bold text-neutral-400 mb-1">Ngày kết thúc</p>
                                                    <p className="text-sm font-medium">{formatDate(room.check_out)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end items-end mt-8 pt-6 border-t border-dashed border-neutral-100">
                                            <div className="text-2xl font-playfair font-bold italic text-neutral-900">{formatPrice(room.total_room_price)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION: DỊCH VỤ ĐI KÈM */}
                    {invoice.booked_services && invoice.booked_services.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-100 flex items-center gap-2">
                                <Sparkle size={18} className="text-neutral-500"/>
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                                    Dịch vụ & Trải nghiệm ({invoice.booked_services.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {invoice.booked_services.map((svc, idx) => (
                                    <div key={idx} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-neutral-50/50 transition-colors group">
                                        
                                        {/* 1. THUMBNAIL DỊCH VỤ */}
                                        <div className="w-full md:w-32 h-32 bg-neutral-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-neutral-100">
                                            <img 
                                                src={svc.service_thumbnail || (svc.service_id?.gallery && svc.service_id.gallery[0]) || 'https://via.placeholder.com/150'} 
                                                alt={svc.service_title} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>

                                        {/* 2. NỘI DUNG CHI TIẾT */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-base mb-1">{svc.service_title}</h4>
                                                    
                                                    {/* HIỂN THỊ PACKAGE & RATE LABEL */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {svc.selected_package && (
                                                            <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                                                {svc.selected_package}
                                                            </span>
                                                        )}
                                                        {svc.selected_rate_label && (
                                                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                                                {svc.selected_rate_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-playfair font-bold text-2xl italic text-neutral-900">{formatPrice(svc.total_service_price)}</p>
                                                    {/* HIỂN THỊ UNIT PRICE */}
                                                    <p className="text-[10px] text-neutral-400 italic">Đơn giá: {formatPrice(svc.unit_price)}</p>
                                                </div>
                                            </div>

                                            {/* GRID THÔNG TIN NGÀY GIỜ */}
                                            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                                <div className="flex items-start gap-2">
                                                    <Clock size={14} className="mt-0.5 text-neutral-400"/>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase block">Thời gian:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {svc.service_dates && svc.service_dates.length > 0 ? (
                                                                svc.service_dates.map((d, i) => (
                                                                    <span key={i} className="bg-white border border-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-medium text-neutral-600">
                                                                        {formatDate(d)}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] font-medium">{formatDate(svc.date)} {svc.time_slot && `- ${svc.time_slot}`}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT: SIDEBAR (4 COLS) --- */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* KHÁCH HÀNG */}
                    <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm relative overflow-hidden">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b pb-4">Thông tin khách hàng</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Chủ hoá đơn</p>
                                <p className="text-xl font-serif italic text-neutral-900">{invoice.customer_info?.full_name}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                                <Envelope size={16}/> {invoice.customer_info?.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                                <Phone size={16}/> {invoice.customer_info?.phone}
                            </div>
                        </div>
                        {invoice.customer_info?.special_requests && (
                            <div className="mt-8 pt-6 border-t border-dashed border-neutral-100 italic text-neutral-500 text-xs">
                                "{invoice.customer_info.special_requests}"
                            </div>
                        )}
                    </div>

                    {/* TỔNG KẾT CHI PHÍ */}
                    <div className="bg-neutral-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-8">Chi tiết thanh toán</h3>
                        
                        <div className="space-y-4 mb-10 text-sm font-light">
                            <div className="flex justify-between text-neutral-400">
                                <span>Tiền phòng nghỉ</span>
                                <span>{formatPrice(invoice.booked_rooms.reduce((s, r) => s + r.total_room_price, 0))}</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                                <span>Dịch vụ & Trải nghiệm</span>
                                <span>{formatPrice(invoice.booked_services.reduce((s, r) => s + r.total_service_price, 0))}</span>
                            </div>
                            <div className="h-px bg-neutral-800 my-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs uppercase font-bold tracking-widest">Tổng cộng</span>
                                <span className="text-3xl font-serif italic text-amber-500">{formatPrice(invoice.final_total)}</span>
                            </div>
                        </div>
                    </div>
                    {invoice.status === 'CHỜ THANH TOÁN ONLINE' && ['VNPAY', 'MOMO'].includes(invoice.payment_method) ? (
                             <div className="mt-4 pt-6 border-t border-neutral-800">
                                <div className="flex items-center gap-2 text-amber-500 text-xs italic mb-3">
                                    <Warning size={16} />
                                    <span>Đơn hàng chưa hoàn tất thanh toán.</span>
                                </div>
                                <button 
                                    onClick={handleRepayment}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center cursor-pointer gap-3 hover:bg-neutral-200 transition-colors uppercase tracking-wider text-xs shadow-lg shadow-white/10"
                                >
                                    <CreditCard size={20} weight="fill"/> Thanh toán ngay ({invoice.payment_method})
                                </button>
                             </div>
                        ) : invoice.status === 'ĐÃ THANH TOÁN' || invoice.status.includes('ĐÃ CHECKIN') ? (
                             <div className="mt-4 pt-6 border-t border-neutral-800">
                                <div className="w-full bg-emerald-900/30 border border-emerald-900 text-emerald-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                                    <CheckCircle size={18} weight="fill"/> Đã thanh toán thành công
                                </div>
                             </div>
                        ) : null}
                </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Find;