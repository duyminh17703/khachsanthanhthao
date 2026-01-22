import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CheckCircle, HouseLine, Printer, Spinner, WarningCircle, Copy } from '@phosphor-icons/react';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingCode = searchParams.get('code'); // Lấy mã từ URL
  const location = useLocation(); // <--- Hook lấy state từ trang trước
  const { clearCart } = useCart();
  const processedRef = useRef(false);
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
      // Chỉ chạy nếu có yêu cầu xóa VÀ chưa từng chạy trước đó
      if (location.state?.shouldClearCart && !processedRef.current) {
          processedRef.current = true; // Đánh dấu đã xử lý ngay lập tức
          
          // Dùng setTimeout để đẩy việc xóa giỏ hàng ra sau 1 chút
          // Giúp UI hiển thị mượt mà trước, không bị khựng lại
          setTimeout(() => {
              clearCart();
              // Xóa state của history để F5 không bị lặp lại
              window.history.replaceState({}, document.title);
          }, 1000); 
      }
  }, [location.state, clearCart]);

  // Gọi API lấy chi tiết đơn hàng để hiển thị
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingCode) return;
        // Gọi API search mà bạn đã có trong InvoiceRoutes
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API_URL}/api/v1/invoices/search/${bookingCode}`);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin đơn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingCode]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // THÊM HÀM NÀY VÀO
  const getPaymentLabel = (method) => {
      switch (method) {
          case 'VNPAY': return 'Chuyển khoản (VNPay)';
          case 'CASH': return 'Thanh toán tại quầy'; // Đây là dòng bạn cần
          case 'MOMO': return 'Ví MoMo';
          default: return method; // Các trường hợp khác
      }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Đang xác thực giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-neutral-100 overflow-hidden animate-fadeIn">
        
        {/* Header Xanh */}
        <div className="bg-green-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CheckCircle size={40} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">Thanh Toán Thành Công!</h1>
          <p className="text-green-100 text-sm">Cảm ơn quý khách đã tin tưởng lựa chọn khách sạn Thanh Thảo.</p>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-8">
            {/* Mã đơn hàng */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-dashed border-neutral-300 mb-6 flex justify-between items-center">
                <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Mã đặt phòng</p>
                    <p className="text-xl font-bold text-neutral-900 font-mono">{bookingCode}</p>
                </div>
                <button 
                    onClick={() => navigator.clipboard.writeText(bookingCode)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-400 hover:text-black"
                    title="Copy mã"
                >
                    <Copy size={20}/>
                </button>
            </div>

            {/* Chi tiết đặt chỗ (Nếu fetch được data) */}
            {booking ? (
                <div className="space-y-4 text-sm text-neutral-600 mb-8">
                    <div className="flex justify-between pb-3 border-b border-neutral-100">
                        <span>Khách hàng:</span>
                        <span className="font-bold text-neutral-900">{booking.customer_info?.full_name}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-neutral-100">
                        <span>Phương thức:</span>
                        <span className="font-bold text-neutral-900">
                            {getPaymentLabel(booking.payment_method)}
                        </span>
                    </div>
                     <div className="flex justify-between pb-3 border-b border-neutral-100">
                        <span>Trạng thái:</span>
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">{booking.status}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-bold text-neutral-900">Tổng thanh toán</span>
                        <span className="text-xl font-serif font-bold text-green-700">{formatPrice(booking.final_total)}</span>
                    </div>
                </div>
            ) : (
                <div className="text-center text-neutral-500 mb-8 italic">
                   Đã ghi nhận giao dịch. Vui lòng kiểm tra email để xem chi tiết.
                </div>
            )}

            {/* Nút bấm */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-colors"
                >
                    <Printer size={18} /> In hóa đơn
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white font-bold text-sm cursor-pointer hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
                >
                    <HouseLine size={18} /> Trang chủ
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;