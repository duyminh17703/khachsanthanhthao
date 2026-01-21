import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showError,showConfirm, showSuccess } from '../../utils/toast';
import { 
  SquaresFour, CalendarCheck, Receipt, Bed, 
  Compass, ForkKnife, Sparkle, Tag, Users, 
  Gear, SignOut, LockKey, X, CaretLeft, CaretRight 
} from '@phosphor-icons/react';

const AdminSidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userLevel = localStorage.getItem('user_level'); 
  
  // [MỚI] State đếm đơn booking mới
  const [pendingBookings, setPendingBookings] = useState(0);

  // [MỚI] Gọi API đếm đơn hàng chờ xác nhận
  useEffect(() => {
    const fetchPendingCount = async () => {
        try {
            const token = localStorage.getItem('admin_token'); 
            if (!token) return;

            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API_URL}/api/v1/invoices/admin/all?status=CHỜ XÁC NHẬN`, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (res.data.success) {
                setPendingBookings(res.data.data.length);
            }
        } catch (error) {
            console.error("Lỗi tải thông báo :", error);
        }
    };

    fetchPendingCount();
    
    // (Tuỳ chọn) Polling mỗi 30s để cập nhật real-time đơn mới
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/hotel/admin/dashboard', icon: <SquaresFour size={24} />, restricted: true },
    
    // [SỬA] Thêm badgeCount cho mục Booking
    { 
        name: 'Quản lý hoá đơn & đặt phòng',   
        path: '/hotel/admin/hoa-don',  
        icon: <CalendarCheck size={24} />, 
        restricted: false,
        badgeCount: pendingBookings // Truyền số lượng vào đây
    },
    { name: 'Quản lý phòng',      path: '/hotel/admin/phong',     icon: <Bed size={24} />,           restricted: true },
    { name: 'Quản lý mục khám phá',  path: '/hotel/admin/kham-pha',  icon: <Compass size={24} />,       restricted: true },
    { name: 'Quản lý mục ẩm thực',    path: '/hotel/admin/am-thuc',    icon: <ForkKnife size={24} />,     restricted: true },
    { name: 'Quản lý mục trải nghiệm',   path: '/hotel/admin/trai-nghiem',  icon: <Sparkle size={24} />,       restricted: true },
    { name: 'Quản lý ưu đãi',     path: '/hotel/admin/uu-dai',    icon: <Tag size={24} />,           restricted: true },
    { name: 'Quản lý nhân viên',  path: '/hotel/admin/nhan-vien', icon: <Users size={24} />,         restricted: true }, 
  ];

  const handleLogout = async () => { 
      // Thêm await để chờ người dùng phản hồi
      if (await showConfirm("Bạn chắc chắn muốn đăng xuất?")) { 
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_level');
          navigate('/hotel/admin');
      }
  };

  const handleNavigate = (path, isRestricted) => {
    if (!isRestricted) {
        navigate(path);
        if (window.innerWidth < 1024) onClose(); 
    }
  };

  return (
    <>
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden glass-effect" onClick={onClose}></div>
        )}

        <div className={`
            fixed top-0 left-0 h-screen bg-white border-r border-neutral-100 z-50 shadow-xl lg:shadow-none
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
            ${isCollapsed ? 'w-80px' : 'w-[260px]'}
        `}>
          
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-50 shadow-sm z-50 transition-colors"
          >
            {isCollapsed ? <CaretRight size={14} weight="bold"/> : <CaretLeft size={14} weight="bold"/>}
          </button>

          <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'} border-b border-neutral-50 transition-all duration-300`}>
            {isCollapsed ? (
                <span className="text-xl font-playfair font-bold">TT</span> 
            ) : (
                <p className='text-2xl font-playfair italic font-semibold truncate whitespace-nowrap animate-fadeIn'>Thanh Thảo</p>
            )}
            <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-black p-1">
                <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-1 h-[calc(100vh-160px)] scrollbar-hide">
            {!isCollapsed && (
                <p className="px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 animate-fadeIn">Danh mục</p>
            )}

            {menuItems.map((item, index) => {
              const isRestricted = item.restricted && userLevel !== 'ADMIN';
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path, isRestricted)}
                  className={`
                    relative flex items-center py-3 cursor-pointer transition-all duration-200 group mx-3 rounded-lg
                    ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
                    ${isActive 
                      ? 'bg-black text-white shadow-lg shadow-black/20' 
                      : isRestricted 
                        ? 'opacity-40 cursor-not-allowed bg-neutral-50' 
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
                    }
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="flex items-center gap-3 relative">
                    <span className={`${isActive ? 'text-white' : (isRestricted ? 'text-neutral-400' : 'text-neutral-500 group-hover:text-black')}`}>
                        {React.cloneElement(item.icon, { size: 20 })} 
                    </span>
                    
                    {!isCollapsed && (
                        <span className={`text-[13px] font-medium tracking-wide whitespace-nowrap animate-fadeIn ${isActive ? 'font-bold' : ''}`}>
                          {item.name}
                        </span>
                    )}

                    {/* [MỚI] BADGE THÔNG BÁO ĐỎ */}
                    {item.badgeCount > 0 && (
                        <span className={`
                            absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white
                            ${isCollapsed ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2' : 'relative ml-auto top-0 right-0'}
                        `}>
                            {item.badgeCount > 9 ? '9+' : item.badgeCount}
                        </span>
                    )}
                  </div>

                  {/* Hiển thị Badge ở chế độ mở rộng (nằm bên phải cùng) */}
                  {!isCollapsed && item.badgeCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm animate-pulse">
                          {item.badgeCount} mới
                      </span>
                  )}

                  {isRestricted && !isCollapsed && <LockKey size={16} className="text-neutral-400" />}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100 bg-neutral-50/80 backdrop-blur-sm">
             <div 
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 text-neutral-500 hover:text-black hover:bg-white rounded-lg cursor-pointer transition-colors mb-1`} 
                onClick={() => showError("Đang phát triển!")}
                title="Settings"
             >
                <Gear size={20} />
                {!isCollapsed && <span className="text-[13px] font-medium animate-fadeIn">Cài đặt</span>}
             </div>

             <div 
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors`} 
                onClick={handleLogout}
                title="Log Out"
             >
                <SignOut size={20} />
                {!isCollapsed && <span className="text-[13px] font-bold animate-fadeIn">Đăng xuất</span>}
             </div>
          </div>
        </div>
    </>
  );
};

export default AdminSidebar;