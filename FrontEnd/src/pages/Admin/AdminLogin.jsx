import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Đừng quên cài đặt: npm install axios

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập thật xuống Backend
      const res = await axios.post('http://localhost:3000/api/v1/admin/login', credentials);

      if (res.data.success) {
        // 2. Lấy dữ liệu từ Server trả về
        const token = res.data.token;
        const level = res.data.data.level;

        // 3. Lưu vào LocalStorage để dùng cho toàn bộ trang Admin
        localStorage.setItem('admin_token', token); 
        localStorage.setItem('user_level', level);     
        navigate('/hotel/admin/dashboard'); 
      }
    } catch (err) {
      // Xử lý lỗi trả về từ Backend (VD: Sai pass, user không tồn tại)
      const serverError = err.response?.data?.message;
      setError(serverError || 'Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      
      {/* Card Container */}
      <div className="bg-white p-8 md:p-12 shadow-2xl rounded-2xl w-full max-w-md border border-neutral-100 animate-fadeIn">
        
        {/* Header */}
        <div className="text-center mb-10">
          {/* Nếu bạn có logo thì bỏ comment dòng dưới */}
          {/* <img src={assets.logo} alt="Logo" className="h-10 mx-auto mb-4 object-contain" /> */}
          <h2 className="text-xl font-serif font-bold text-neutral-900 tracking-wide uppercase">
            Quản trị hệ thống khách sạn
          </h2>
          <p className="text-neutral-400 text-xs mt-2 font-light">
            Đăng nhập để truy cập
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-sm placeholder-neutral-300"
              placeholder="Nhập username..."
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-sm placeholder-neutral-300"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2 rounded-sm animate-pulse">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-100 pt-6">
            <p className="text-[10px] text-neutral-400 font-serif italic">
                &copy; 2024 Hotel Management System
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;