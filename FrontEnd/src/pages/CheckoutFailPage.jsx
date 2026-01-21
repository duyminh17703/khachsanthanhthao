import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, HouseLine, PhoneCall, ArrowCounterClockwise, WarningCircle } from '@phosphor-icons/react';

const CheckoutFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingCode = searchParams.get('code');
  const vnpCode = searchParams.get('vnp_ResponseCode'); 

  // Hàm dịch mã lỗi VNPay (Optional)
  const getErrorMessage = (code) => {
    switch (code) {
      case '24': return 'Giao dịch bị hủy bởi khách hàng.';
      case '51': return 'Tài khoản không đủ số dư.';
      case '11': return 'Hết thời gian chờ thanh toán.';
      case '75': return 'Ngân hàng bảo trì.';
      default: return 'Giao dịch không thành công do lỗi hệ thống hoặc thẻ.';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-neutral-100 overflow-hidden animate-fadeIn">
        
        {/* Header Đỏ */}
        <div className="bg-red-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <XCircle size={40} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">Thanh Toán Thất Bại</h1>
          <p className="text-red-100 text-sm">Rất tiếc, giao dịch của bạn chưa hoàn tất.</p>
        </div>

        {/* Nội dung */}
        <div className="p-8">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <WarningCircle size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-700 mb-1">Lý do lỗi:</p>
                        <p className="text-sm text-red-600">
                           {vnpCode ? getErrorMessage(vnpCode) : "Gặp sự cố trong quá trình xử lý thanh toán."}
                        </p>
                    </div>
                </div>
            </div>

            {bookingCode && (
                <div className="text-center mb-8">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Mã đơn hàng</p>
                    <p className="text-lg font-bold text-neutral-900 font-mono">{bookingCode}</p>
                </div>
            )}

            <div className="space-y-3">
                {/* Nút gọi hỗ trợ */}
                <a 
                    href="tel:0942819936"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-colors"
                >
                    <PhoneCall size={18} /> Liên hệ hỗ trợ
                </a>

                {/* Nút quay về (Thường sẽ quay về trang Home hoặc trang xem lại đơn hàng để thanh toán lại) */}
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white font-bold text-sm cursor-pointer hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
                >
                    <HouseLine size={18} /> Về trang chủ
                </button>
            </div>

            <p className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
                Nếu bạn đã bị trừ tiền nhưng nhận được thông báo này, vui lòng liên hệ ngay hotline để được hỗ trợ hoàn tiền hoặc xác nhận thủ công.
            </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFail;