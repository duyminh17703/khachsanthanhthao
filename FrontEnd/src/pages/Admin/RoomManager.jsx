import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { Plus, Pencil, Trash, Funnel, MagnifyingGlass } from '@phosphor-icons/react';
import { showError, showSuccess } from '../../utils/toast';

const RoomManager = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Hàm lấy danh sách phòng từ Server
  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Gọi API với query params
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/api/v1/rooms/list-rooms`, {
        params: {
          type: filterType,
          search: searchTerm
        }
      });
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API mỗi khi filter thay đổi (có Debounce cho search)
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchRooms();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, searchTerm]);

  // 2. Hàm Xóa phòng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này không?")) return;

    try {
      const token = localStorage.getItem('admin_token');
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.delete(`${API_URL}/api/v1/rooms/delete-room`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });
      
      fetchRooms(); // Load lại danh sách
      showSuccess("Đã xóa thành công!");
    } catch (error) {
      showError("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <AdminLayout title="Quản lý Phòng">
      
      {/* TOOLBAR: Search & Filter & Add New */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <input 
                    type="text" 
                    placeholder="Tìm tên phòng..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none pl-10 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                    <option value="ALL">Tất cả loại</option>
                    <option value="STANDARD">Standard</option>
                    <option value="LUXURY">Luxury</option>
                </select>
                <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            </div>
        </div>

        {/* Right: Add Button */}
        <button 
            onClick={() => navigate('/hotel/admin/rooms/add')}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            <Plus size={16} weight="bold" />
            Thêm phòng mới
        </button>
      </div>

      {/* TABLE LIST (RESPONSIVE WRAPPER) */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        
        {/* div này giúp bảng cuộn ngang trên mobile */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Hình ảnh</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Tên phòng</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Trạng thái</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Giá / Đêm</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right whitespace-nowrap">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {loading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Đang tải dữ liệu...</td></tr>
                    ) : rooms.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Không tìm thấy phòng nào.</td></tr>
                    ) : (
                        rooms.map((room) => (
                            <tr key={room._id} className="hover:bg-neutral-50/50 transition-colors group">
                                <td className="p-4 w-24">
                                    <img src={room.hero?.image} alt={room.title} className="w-16 h-12 object-cover rounded-md bg-neutral-200" />
                                </td>
                                <td className="p-4">
                                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{room.title}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${
                                            room.typeRoom === 'LUXURY' 
                                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {room.typeRoom}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                            room.is_available 
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {room.is_available ? 'Đang mở' : 'Đang khoá'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-serif font-medium whitespace-nowrap">
                                    {formatPrice(room.base_price)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => navigate(`/hotel/admin/rooms/edit/${room._id}`)}
                                            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Sửa"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(room._id)}
                                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Xóa"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoomManager;