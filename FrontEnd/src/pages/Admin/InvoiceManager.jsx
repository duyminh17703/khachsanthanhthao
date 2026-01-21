import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { 
  MagnifyingGlass, Eye, CalendarBlank, 
  Tag, Bed, CheckCircle, WarningCircle, Money
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const InvoiceManager = () => { // Đổi tên component cho khớp file (BookingManager -> InvoiceManager)
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();   

  const fetchBookings = async () => {
   try {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        const query = `?status=${filterStatus}&search=${searchTerm}`;

        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/v1/invoices/admin/all${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            setBookings(response.data.data);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
        console.error("Lỗi:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filterStatus]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchBookings() }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

    const tabs = [
        { label: 'Tất cả', value: 'ALL' },
        { label: 'Mới đặt', value: 'CHỜ XÁC NHẬN' },
        { label: 'Chờ TT Online', value: 'CHỜ THANH TOÁN ONLINE' }, // [MỚI]
        { label: 'Chờ Check-in', value: 'ĐÃ XÁC NHẬN-CHỜ CHECKIN' },
        { label: 'Đã TT & Chờ Check-in', value: 'ĐÃ THANH TOÁN-CHỜ CHECKIN' }, // [MỚI]
        { label: 'Đang ở (Check-in)', value: 'ĐÃ CHECKIN' }, // [MỚI]
        { label: 'Hoàn tất', value: 'ĐÃ HOÀN THÀNH' }, // [MỚI]
        { label: 'Đã hủy', value: 'ĐÃ HUỶ' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'CHỜ XÁC NHẬN': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'CHỜ THANH TOÁN ONLINE': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'ĐÃ XÁC NHẬN-CHỜ CHECKIN': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ĐÃ THANH TOÁN-CHỜ CHECKIN': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'ĐÃ CHECKIN': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'ĐÃ HOÀN THÀNH': return 'bg-green-50 text-green-700 border-green-200';
            case 'ĐÃ HUỶ': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  return (
    <AdminLayout title="Quản lý Đặt phòng">
        
        {/* Tool bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex overflow-x-auto gap-2 w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {tabs.map((tab) => (
                        <button key={tab.value} onClick={() => setFilterStatus(tab.value)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold cursor-pointer uppercase tracking-wider transition-all ${filterStatus === tab.value ? 'bg-black text-white shadow-lg' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-[300px]">
                    <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-black transition-colors"/>
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Mã đơn</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Khách hàng</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Loại hình / Phòng</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Ngày ở</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Tài chính</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-center">Trạng thái đơn</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {bookings.map((item) => (
                            <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                                {/* 1. MÃ ĐƠN */}
                                <td className="p-4 font-mono text-xs font-bold text-neutral-600">
                                    {item.booking_code}
                                </td>

                                {/* 2. KHÁCH HÀNG (Gộp Tên + Liên hệ) */}
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-900">{item.customer_info.full_name}</span>
                                        <span className="text-[11px] text-neutral-500">{item.customer_info.phone}</span>
                                    </div>
                                </td>
                                
                                {/* 3. LOẠI HÌNH / PHÒNG */}
                                <td className="p-4">
                                    {item.booked_rooms.map((room, i) => (
                                        <div key={i} className="mb-1 last:mb-0 flex items-center gap-2">
                                            {room.is_combo ? (
                                                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-amber-200">Combo</span>
                                            ) : (
                                                <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-neutral-200">Phòng</span>
                                            )}
                                            <span className="text-xs text-neutral-700 truncate max-w-[150px]">{room.room_title}</span>
                                        </div>
                                    ))}
                                </td>

                                {/* 4. NGÀY Ở */}
                                <td className="p-4 text-xs text-neutral-600">
                                    {item.booked_rooms.length > 0 && (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900">
                                                {formatDate(item.booked_rooms[0].check_in)}
                                            </span>
                                            <span className="text-[12px] text-neutral-400">đến {formatDate(item.booked_rooms[0].check_out)}</span>
                                        </div>
                                    )}
                                </td>

                                {/* 5. TÀI CHÍNH (Gộp Tổng tiền + Trạng thái TT) */}
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-neutral-900 font-serif">{formatPrice(item.final_total)}</span>
                                        <div className="flex items-center gap-1 mt-1">
                                            {item.is_paid ? (
                                                <span className="text-[9px] font-bold uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Đã thanh toán</span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">Chưa thanh toán</span>
                                            )}
                                            <span className="text-[9px] text-neutral-400 font-mono italic">{item.payment_method === 'CASH' ? 'TIỀN MẶT' : item.payment_method}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* 6. TRẠNG THÁI ĐƠN */}
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>

                                {/* 7. THAO TÁC */}
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => navigate(`/hotel/admin/invoices/${item.booking_code}`)} 
                                        className="p-2 text-neutral-400 cursor-pointer hover:text-black hover:bg-neutral-100 rounded-full transition-all" 
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </AdminLayout>
  );
};

export default InvoiceManager;