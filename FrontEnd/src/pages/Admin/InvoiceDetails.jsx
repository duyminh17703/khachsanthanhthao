import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Printer, Phone, Envelope, 
  CalendarCheck, CalendarBlank, Bed, 
  CheckCircle, XCircle, CreditCard, User, 
  PencilSimple, FloppyDisk, X, Note, Tag, Trash, CalendarPlus,
  Gift, Sparkle 
} from '@phosphor-icons/react';
import { showSuccess, showError, showConfirm } from '../../utils/toast'; 

// --- 1. COMPONENT LỊCH (Giữ nguyên) ---
const MultiDateCalendarSelector = ({ onClose, onDateSelect, initialDates, validRange }) => {
    const toTimestamp = (date) => {
      const d = new Date(date); 
      if (isNaN(d.getTime())) return 0;
      d.setHours(0, 0, 0, 0); 
      return d.getTime();
    };
  
    const minValidTs = validRange?.start ? toTimestamp(validRange.start) : null;
    const maxValidTs = validRange?.end ? toTimestamp(validRange.end) : null;

    const [currentDate, setCurrentDate] = useState(() => {
        if (initialDates && initialDates.length > 0) return new Date(initialDates[0]);
        return validRange?.start ? new Date(validRange.start) : new Date();
    });

    const [tempSelectedDates, setTempSelectedDates] = useState(initialDates || []);
  
    const changeMonth = (offset) => {
      const newDate = new Date(currentDate); 
      newDate.setMonth(newDate.getMonth() + offset); 
      setCurrentDate(newDate);
    };
  
    const handleDayClick = (date) => {
      const dayTs = toTimestamp(date);
      if (minValidTs && dayTs < minValidTs) return;
      if (maxValidTs && dayTs > maxValidTs) return;

      const exists = tempSelectedDates.find(d => toTimestamp(d) === dayTs);
      if (exists) setTempSelectedDates(prev => prev.filter(d => toTimestamp(d) !== dayTs));
      else setTempSelectedDates(prev => [...prev, new Date(dayTs)].sort((a, b) => a - b));
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
         const isSelected = tempSelectedDates.some(d => toTimestamp(d) === dayTs);
         const isDisabled = (minValidTs && dayTs < minValidTs) || (maxValidTs && dayTs > maxValidTs);

         days.push(
           <div key={i} onClick={() => !isDisabled && handleDayClick(date)}
             className={`h-8 w-8 flex items-center justify-center text-xs font-medium rounded-full transition-all ${isDisabled ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-200 bg-stone-50 text-neutral-600'} ${isSelected ? 'bg-black! text-white! shadow-md' : ''}`}>
              {i}
           </div>
         );
      }
      return (
        <div>
           <div className="text-center mb-4 font-bold text-sm capitalize">Tháng {month + 1}, {year}</div>
           <div className="grid grid-cols-7 mb-2 text-[10px] font-bold text-neutral-400 text-center"><span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span></div>
           <div className="grid grid-cols-7 gap-1 text-center">{days}</div>
        </div>
      );
    };
  
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-up">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 pb-2">
                <h3 className="font-bold text-sm uppercase">Chọn ngày dịch vụ</h3>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-neutral-100 rounded">‹</button>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-neutral-100 rounded">›</button>
                </div>
            </div>
            {renderMonth(currentDate)}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-500">Đã chọn: <b>{tempSelectedDates.length}</b> ngày</span>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold uppercase text-neutral-500 hover:bg-neutral-100 rounded">Huỷ</button>
                    <button onClick={() => { onDateSelect(tempSelectedDates); onClose(); }} className="px-4 py-1.5 text-xs font-bold uppercase bg-black text-white rounded hover:bg-neutral-800">Lưu</button>
                </div>
            </div>
        </div>
      </div>
    );
};

// --- MAIN COMPONENT ---
const InvoiceDetail = () => {
  const { code } = useParams(); 
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('admin_token');

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({});
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomForm, setRoomForm] = useState({ check_in: '', check_out: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [tempServiceDates, setTempServiceDates] = useState([]);
  
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
  const formatDateForInput = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
        case 'CHỜ XÁC NHẬN': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'CHỜ THANH TOÁN ONLINE': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'ĐÃ XÁC NHẬN-CHỜ CHECKIN': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'ĐÃ THANH TOÁN-CHỜ CHECKIN': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'ĐÃ CHECKIN': return 'bg-purple-50 text-purple-700 border-purple-200'; // Đang ở
        case 'ĐÃ HOÀN THÀNH': return 'bg-green-50 text-green-700 border-green-200';
        case 'ĐÃ HUỶ': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isLocked = booking?.status === 'ĐÃ HOÀN THÀNH' || booking?.status === 'ĐÃ HUỶ';
  
  // [LOGIC MỚI] Chỉ cho phép thao tác Check-in khi đơn KHÔNG bị khoá VÀ đã qua bước Xác nhận
  const canCheckInRoom = !isLocked && 
        booking?.status !== 'CHỜ XÁC NHẬN' && 
        booking?.status !== 'CHỜ THANH TOÁN ONLINE';

  const canPay = useMemo(() => booking?.booked_rooms?.every(r => r.status === 'ĐÃ CHECKIN' || r.status === 'HUỶ'), [booking]);

  const fetchDetail = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${API_URL}/api/v1/invoices/detail/${code}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { setBooking(res.data.data); setInfoForm(res.data.data.customer_info); }
    } catch (error) { showError("Lỗi tải đơn"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [code]);

  const validDateRange = useMemo(() => {
      if (!booking?.booked_rooms?.length) return null;
      const checkIns = booking.booked_rooms.map(r => new Date(r.check_in).getTime()).filter(t => !isNaN(t));
      const checkOuts = booking.booked_rooms.map(r => new Date(r.check_out).getTime()).filter(t => !isNaN(t));
      if(checkIns.length === 0) return null;
      return { start: new Date(Math.min(...checkIns)), end: new Date(Math.max(...checkOuts)) };
  }, [booking]);

  // --- ACTIONS (API Calls) ---
  const handleSaveCustomerInfo = async () => {
      if (isLocked) return;
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.put(`${API_URL}/api/v1/invoices/admin/update-customer`, { id: booking._id, customer_info: infoForm }, { headers: { Authorization: `Bearer ${token}` } });
          if (res.data.success) { showSuccess("Đã lưu thông tin"); setBooking(res.data.data); setIsEditingInfo(false); }
      } catch (error) { showError("Lỗi cập nhật"); }
  };

  const handleInvoiceAction = async (newStatus) => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.put(`${API_URL}/api/v1/invoices/admin/update-status`, { id: booking._id, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) { showSuccess("Cập nhật thành công"); setBooking(res.data.data); }
      } catch (error) { showError("Lỗi cập nhật"); }
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
      // [LOGIC MỚI] Chặn ngay nếu chưa xác nhận
      if (booking.status === 'CHỜ XÁC NHẬN') {
          showError("Vui lòng xác nhận đặt phòng trước!");
          return;
      }
      if (isLocked) return;
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.put(`${API_URL}/api/v1/invoices/admin/update-room-status`, { invoiceId: booking._id, roomId, roomStatus: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
          if (res.data.success) { showSuccess("Đã cập nhật phòng"); setBooking(res.data.data); }
      } catch (error) { showError("Lỗi cập nhật"); }
  };

  const startEditRoom = (room) => {
      if (isLocked) return;
      setEditingRoomId(room._id);
      setRoomForm({ check_in: formatDateForInput(room.check_in), check_out: formatDateForInput(room.check_out) });
  };

  const saveRoomDate = async (roomId) => {
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.put(`${API_URL}/api/v1/invoices/admin/update-room-dates`, { invoiceId: booking._id, roomId, checkIn: roomForm.check_in, checkOut: roomForm.check_out }, { headers: { Authorization: `Bearer ${token}` } });
          if (res.data.success) { showSuccess("Đã tính lại tiền phòng!"); setBooking(res.data.data); setEditingRoomId(null); }
      } catch (error) { showError(error.response?.data?.message || "Lỗi cập nhật ngày"); }
  };

  const openServiceCalendar = (svc) => {
      if (isLocked) return;
      setEditingServiceId(svc._id);
      let initialDates = [];
      if (svc.service_dates?.length > 0) initialDates = svc.service_dates.map(dateStr => new Date(dateStr));
      else if (svc.date) initialDates = [new Date(svc.date)];
      setTempServiceDates(initialDates);
  };
  
  const saveServiceDates = async (newDates) => {
      if(newDates.length === 0) {
          if(await showConfirm("Bỏ chọn hết ngày sẽ xoá dịch vụ này?")) removeService(editingServiceId);
          setEditingServiceId(null); return;
      }
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.put(`${API_URL}/api/v1/invoices/admin/update-service-dates`, { invoiceId: booking._id, serviceItemId: editingServiceId, newDates }, { headers: { Authorization: `Bearer ${token}` } });
          if(res.data.success) { showSuccess("Đã cập nhật lịch!"); setBooking(res.data.data); }
      } catch (error) { showError("Lỗi cập nhật"); } finally { setEditingServiceId(null); }
  };

  const removeService = async (serviceId) => {
      if (isLocked) return;
      if(!await showConfirm("Xoá dịch vụ này?")) return;
      try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.delete(`${API_URL}/api/v1/invoices/admin/remove-service`, { headers: { Authorization: `Bearer ${token}` }, data: { invoiceId: booking._id, serviceItemId: serviceId } });
          if(res.data.success) { showSuccess("Đã xoá"); setBooking(res.data.data); }
      } catch (error) { showError("Lỗi xoá"); }
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-10 font-sans text-neutral-800 relative">
        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white border border-neutral-200 rounded-full cursor-pointer hover:bg-neutral-100 transition-colors print:hidden">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-neutral-900">Đơn #{booking.booking_code.replace('FS-', '')}</h1>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </div>
                    <p className="text-xs text-neutral-500">Tạo ngày: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 print:hidden">
                {/* CASE 1: ĐƠN MỚI (TIỀN MẶT) -> CẦN XÁC NHẬN */}
                {booking.status === 'CHỜ XÁC NHẬN' && (
                    <button 
                        onClick={() => handleInvoiceAction('ĐÃ XÁC NHẬN-CHỜ CHECKIN')} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <CheckCircle size={18} /> Xác nhận đặt phòng
                    </button>
                )}

                {/* CASE 2: KHÁCH ĐANG Ở (ĐÃ CHECKIN) -> TRẢ PHÒNG & HOÀN TẤT */}
                {/* Nút này hiện ra khi trạng thái chung là ĐÃ CHECKIN (tức là tất cả phòng đã checkin xong theo logic backend) */}
                {booking.status === 'ĐÃ CHECKIN' && (
                    <button 
                        onClick={() => handleInvoiceAction('ĐÃ HOÀN THÀNH')} 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm animate-pulse"
                    >
                        <CreditCard size={18} /> Thanh toán & Hoàn tất
                    </button>
                )}

                {/* NÚT HUỶ (Chỉ hiện khi chưa hoàn thành/huỷ) */}
                {!isLocked && (
                    <button onClick={() => handleInvoiceAction('ĐÃ HUỶ')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><XCircle size={18} /> Huỷ đơn</button>
                )}
            </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* === CỘT TRÁI === */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. DANH SÁCH LƯU TRÚ (PHÒNG & COMBO) */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-neutral-800 flex items-center gap-2">
                            <Bed size={20} className="text-neutral-500"/> Chi tiết lưu trú ({booking.booked_rooms.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {booking.booked_rooms.map((room, index) => (
                            <div key={index} className={`p-6 flex flex-col md:flex-row gap-6 relative group ${room.is_combo ? 'bg-amber-50/40' : 'bg-white'}`}>
                                
                                {/* ẢNH THUMBNAIL */}
                                <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0 relative border border-neutral-200">
                                    {room.room_thumbnail ? (
                                        <img src={room.room_thumbnail} alt="thumb" className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-100">
                                            {room.is_combo ? <Tag size={24} /> : <Bed size={24}/>}
                                        </div>
                                    )}
                                    {room.is_combo && (
                                        <div className="absolute top-0 left-0 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase shadow-sm">Combo</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-lg ${room.is_combo ? 'text-amber-900' : 'text-neutral-900'}`}>
                                            {room.room_title}
                                        </h3>
                                        <div className="text-right">
                                            <div className="font-bold text-neutral-900">{formatPrice(room.total_room_price)}</div>
                                            <div className="text-[10px] text-neutral-500">({formatPrice(room.price_per_night)}/đêm)</div>
                                        </div>
                                    </div>
                                    
                                    {room.is_combo && room.offer_id && (
                                        <div className="mb-4 bg-white/60 p-3 rounded border border-amber-200/50">
                                            <p className="text-[10px] font-bold uppercase text-amber-700 mb-1 flex items-center gap-1">
                                                <Sparkle size={12} weight="fill"/> Quyền lợi bao gồm:
                                            </p>
                                            <ul className="space-y-1">
                                                {room.offer_id.included_rooms?.map((r, idx) => (
                                                    <li key={`r-${idx}`} className="text-xs text-neutral-600 flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                                                        {r.quantity}x {r.room_id?.title || "Phòng nghỉ"}
                                                    </li>
                                                ))}
                                                {room.offer_id.included_services?.map((s, idx) => (
                                                    <li key={`s-${idx}`} className="text-xs text-neutral-600 flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                                                        Tặng: {s.package_title || "Dịch vụ"} {s.label && `(${s.label})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* FORM CHỈNH SỬA NGÀY */}
                                    {editingRoomId === room._id ? (
                                        <div className="bg-neutral-50 border border-blue-200 p-2 rounded mb-2 grid grid-cols-2 gap-2">
                                            <input type="date" value={roomForm.check_in} onChange={e => setRoomForm({...roomForm, check_in: e.target.value})} className="text-xs border p-1 rounded"/>
                                            <input type="date" value={roomForm.check_out} onChange={e => setRoomForm({...roomForm, check_out: e.target.value})} className="text-xs border p-1 rounded"/>
                                            <div className="col-span-2 flex justify-end gap-2">
                                                <button onClick={() => setEditingRoomId(null)} className="text-[10px] uppercase font-bold text-neutral-500">Huỷ</button>
                                                <button onClick={() => saveRoomDate(room._id)} className="text-[10px] uppercase font-bold text-blue-600">Lưu</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => !isLocked && startEditRoom(room)} 
                                            className={`flex gap-4 text-sm text-neutral-600 mb-4 transition-colors ${!isLocked ? 'cursor-pointer hover:text-blue-600' : ''}`} 
                                            title={!isLocked ? "Bấm để sửa ngày" : "Không thể sửa khi đã thanh toán"}
                                        >
                                            <div className="flex items-center gap-2"><CalendarCheck size={16} className="text-neutral-400"/> Ngày nhận phòng: <span className="font-medium text-black">{formatDate(room.check_in)}</span></div>
                                            <div className="flex items-center gap-2"><CalendarBlank size={16} className="text-neutral-400"/> Ngày trả phòng: <span className="font-medium text-black">{formatDate(room.check_out)}</span></div>
                                        </div>
                                    )}

                                    {/* SELECT TRẠNG THÁI PHÒNG - CÓ LOGIC KHOÁ */}
                                    <div className="flex items-center gap-3 bg-white border border-neutral-100 p-2 rounded-lg w-fit print:hidden">
                                        <span className="text-xs font-bold uppercase text-neutral-500 pl-1">Trạng thái:</span>
                                        <select 
                                            disabled={!canCheckInRoom} 
                                            value={room.status || 'CHỜ CHECKIN'} 
                                            onChange={(e) => handleRoomStatusChange(room._id, e.target.value)} 
                                            className={`text-xs font-bold uppercase bg-transparent outline-none ${!canCheckInRoom ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer text-black'}`}
                                            title={!canCheckInRoom ? "Vui lòng Xác nhận đặt phòng trước" : ""}
                                        >
                                            <option value="CHỜ CHECKIN">Chờ Check-in</option>
                                            <option value="ĐÃ CHECKIN">Đã Check-in</option>
                                            <option value="HUỶ">Huỷ phòng này</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. DỊCH VỤ BỔ SUNG */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-neutral-800 flex items-center gap-2"><Tag size={20} className="text-neutral-500"/> Dịch vụ bổ sung</h2>
                    </div>
                    
                    {booking.booked_services.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400 text-sm">Chưa có dịch vụ bổ sung nào.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-neutral-50 text-neutral-500 font-medium uppercase tracking-wider text-[10px] border-y border-neutral-100">
                                    <tr>
                                        <th className="px-6 py-4 w-180px">Hình ảnh</th>
                                        <th className="px-6 py-4">Dịch vụ & Gói</th>
                                        <th className="px-6 py-4 text-center">Đơn giá</th>
                                        <th className="px-6 py-4 text-center w-[140px]">Lịch sử dụng</th>
                                        <th className="px-6 py-4 text-right">Thành tiền</th>
                                        {!isLocked && <th className="px-6 py-4 w-[60px]"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {booking.booked_services.map((svc, i) => (
                                        <tr key={i} className="hover:bg-neutral-50/50 transition-colors group">
                                            {/* 1. Hình ảnh */}
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                                                    {svc.service_thumbnail ? (
                                                        <img src={svc.service_thumbnail} alt="svc" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Tag size={18} className="text-neutral-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 2. Tên dịch vụ & Gói */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-neutral-900 leading-tight">
                                                        {svc.service_title}
                                                    </span>
                                                    <span className="text-[11px] text-neutral-500 mt-1 bg-neutral-100 w-fit px-1.5 py-0.5 rounded">
                                                        {svc.selected_package}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 3. Đơn giá */}
                                            <td className="px-6 py-4 text-center text-neutral-600 font-medium">
                                                {formatPrice(svc.unit_price)}
                                            </td>

                                            {/* 4. Lịch sử dụng */}
                                            <td className="px-6 py-4">
                                                <button
                                                    disabled={isLocked}
                                                    onClick={() => openServiceCalendar(svc)}
                                                    className={`w-full flex items-center justify-between gap-2 bg-white border border-neutral-200 rounded-md py-2 px-3 transition-all ${
                                                        isLocked 
                                                        ? 'opacity-60 cursor-not-allowed' 
                                                        : 'cursor-pointer hover:border-blue-500 hover:shadow-sm group/btn'
                                                    }`}
                                                >
                                                    <span className="font-bold text-neutral-900 text-xs">
                                                        {svc.service_dates?.length || svc.quantity} ngày
                                                    </span>
                                                    {!isLocked && <CalendarPlus size={14} className="text-neutral-400 group-hover/btn:text-blue-500" />}
                                                </button>
                                            </td>

                                            {/* 5. Thành tiền */}
                                            <td className="px-6 py-4 text-right font-bold text-neutral-900">
                                                {formatPrice(svc.total_service_price)}
                                            </td>

                                            {/* 6. Thao tác xóa */}
                                            {!isLocked && (
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => removeService(svc._id)}
                                                        className="text-neutral-300 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                        title="Xóa dịch vụ"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* TÀI CHÍNH */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <h2 className="font-bold text-neutral-800 mb-4 flex items-center gap-2"><CreditCard size={20} className="text-neutral-500"/> Chi tiết thanh toán</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-neutral-600"><span>Tổng tiền lưu trú (Phòng & Combo)</span><span className="font-medium">{formatPrice(booking.booked_rooms.reduce((acc, cur) => acc + cur.total_room_price, 0))}</span></div>
                        {booking.booked_services.length > 0 && (
                            <div className="flex justify-between text-neutral-600"><span>Tổng dịch vụ bổ sung</span><span className="font-medium">{formatPrice(booking.booked_services.reduce((acc, cur) => acc + cur.total_service_price, 0))}</span></div>
                        )}
                        <div className="flex justify-between text-neutral-600"><span>Thuế & Phí dịch vụ (10%)</span><span className="italic text-neutral-400">Đã bao gồm</span></div>
                        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center mt-2">
                            <span className="text-base font-bold text-neutral-900 uppercase tracking-wide">Tổng cộng</span>
                            <span className="text-2xl font-bold text-neutral-900">{formatPrice(booking.final_total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === CỘT PHẢI: KHÁCH HÀNG === */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="font-bold text-neutral-800 flex items-center gap-2"><User size={20} className="text-neutral-500"/> Khách hàng</h2>
                        <div className="print:hidden">
                            {!isLocked && (
                                !isEditingInfo ? (
                                    <button onClick={() => setIsEditingInfo(true)} className="text-blue-600 hover:text-blue-800 text-xs font-bold cursor-pointer uppercase flex items-center gap-1"><PencilSimple size={14}/> Sửa</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveCustomerInfo} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase flex items-center gap-1"><FloppyDisk size={14}/> Lưu</button>
                                        <button onClick={() => setIsEditingInfo(false)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase"><X size={14}/></button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="group"><label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Họ và tên</label>{isEditingInfo ? <input type="text" value={infoForm.full_name} onChange={e => setInfoForm({...infoForm, full_name: e.target.value})} className="w-full border-b border-neutral-300 focus:border-black outline-none py-1 text-sm bg-transparent"/> : <div className="font-medium text-neutral-900">{booking.customer_info.full_name}</div>}</div>
                        <div className="group"><label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Số điện thoại</label>{isEditingInfo ? <input type="text" value={infoForm.phone} onChange={e => setInfoForm({...infoForm, phone: e.target.value})} className="w-full border-b border-neutral-300 focus:border-black outline-none py-1 text-sm bg-transparent"/> : <div className="flex items-center gap-2 text-neutral-700 text-sm"><Phone size={16} className="text-neutral-400"/> {booking.customer_info.phone}</div>}</div>
                        <div className="group"><label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Email</label>{isEditingInfo ? <input type="text" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} className="w-full border-b border-neutral-300 focus:border-black outline-none py-1 text-sm bg-transparent"/> : <div className="flex items-center gap-2 text-neutral-700 text-sm"><Envelope size={16} className="text-neutral-400"/> {booking.customer_info.email}</div>}</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <h2 className="font-bold text-neutral-800 mb-4 flex items-center gap-2"><Note size={20} className="text-neutral-500"/> Yêu cầu đặc biệt</h2>
                    {isEditingInfo ? (
                        <textarea rows={4} value={infoForm.special_requests} onChange={e => setInfoForm({...infoForm, special_requests: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:border-black outline-none" placeholder="Không có ghi chú..."/>
                    ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 italic leading-relaxed">{booking.customer_info.special_requests || "Không có yêu cầu đặc biệt."}</div>
                    )}
                </div>
            </div>
        </div>

        {!isLocked && editingServiceId && (
            <MultiDateCalendarSelector 
                initialDates={tempServiceDates}
                onClose={() => setEditingServiceId(null)}
                onDateSelect={saveServiceDates}
                validRange={validDateRange}
            />
        )}

        {/* NÚT IN HOÁ ĐƠN: Hiện khi đã hoàn thành hoặc đã thanh toán */}
        {(booking.status === 'ĐÃ HOÀN THÀNH' || booking.status === 'ĐÃ THANH TOÁN') && (
            <button onClick={() => window.print()} className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-6 py-4 bg-neutral-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-black hover:scale-105 transition-all duration-300 print:hidden animate-bounce-in" title="In hoá đơn">
                <Printer size={20} weight="fill" />
                <span className="font-bold uppercase tracking-widest text-xs">In hoá đơn</span>
            </button>
        )}
    </div>
  );
};

export default InvoiceDetail;