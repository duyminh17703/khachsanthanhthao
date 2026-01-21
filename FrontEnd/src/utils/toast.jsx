import toast from 'react-hot-toast';
import { CheckCircle, XCircle, WarningCircle } from '@phosphor-icons/react';

// ===============================================
// 1. THÔNG BÁO THÀNH CÔNG (Dấu V xanh)
// ===============================================
export const showSuccess = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle size={24} weight="fill" className="text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-gray-900 font-playfair">Thành công</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 300});
};

// ===============================================
// 2. THÔNG BÁO THẤT BẠI (Dấu X đỏ)
// ===============================================
export const showError = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 border-l-4 border-red-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <XCircle size={24} weight="fill" className="text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-red-600 font-playfair">Đã có lỗi xảy ra</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 500 });
};

// ===============================================
// 3. FORM XÁC NHẬN (Promise - Chờ người dùng chọn)
// ===============================================
export const showConfirm = (message, confirmText = "Đồng ý", cancelText = "Hủy bỏ") => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto ring-1 ring-black/5 p-6 text-center`}
      >
        <div className="flex justify-center mb-4 text-orange-500">
            <WarningCircle size={48} weight="duotone" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 font-playfair mb-2">Xác nhận hành động</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
            {/* Nút Hủy */}
            <button
                onClick={() => {
                    toast.remove(t.id);
                    resolve(false); // Trả về False
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase cursor-pointer rounded-lg transition-colors"
            >
                {cancelText}
            </button>

            {/* Nút Chấp nhận */}
            <button
                onClick={() => {
                    toast.remove(t.id);
                    resolve(true); // Trả về True
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase cursor-pointer rounded-lg shadow-lg transition-all"
            >
                {confirmText}
            </button>
        </div>
      </div>
    ), { 
        duration: Infinity, // Không tự tắt
        position: 'top-center'
    });
  });
};