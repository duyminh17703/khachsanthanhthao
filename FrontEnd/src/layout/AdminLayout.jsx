import React, { useState, useEffect } from 'react'; // Thêm useEffect
import AdminSidebar from '../components/admin/AdminSidebar';
import { List, MagnifyingGlass } from '@phosphor-icons/react';

const AdminLayout = ({ children, title }) => {
  // 1. State cho Mobile (Drawer)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 2. State cho Desktop (Thu gọn/Mở rộng)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar_collapsed');
    return savedState === 'true'; // Nếu lưu 'true' thì trả về true, ngược lại false
  });

  // Hàm toggle mới: Vừa set state, vừa lưu vào localStorage
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row"> 
      
      {/* Sidebar: Truyền hàm toggle mới vào */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={handleToggleCollapse} 
      />

      {/* Main Content Area */}
      <main 
        className={`
            flex-1 w-full p-4 lg:p-8 transition-all duration-300 ease-in-out
            ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}
        `}
      >
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6 lg:mb-8 gap-4">
            <div className="flex items-center gap-3">
                {/* NÚT HAMBURGER (Chỉ hiện trên Mobile) */}
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-neutral-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                    <List size={24} weight="bold"/>
                </button>

                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 tracking-tight line-clamp-1">{title}</h1>
                </div>
            </div>
        </div>

        {/* Nội dung */}
        <div className="animate-fadeIn">
            {children}
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;