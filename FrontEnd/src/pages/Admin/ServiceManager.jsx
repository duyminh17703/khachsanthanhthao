import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { Plus, Pencil, Trash, Funnel, MagnifyingGlass } from '@phosphor-icons/react';

// Cấu hình Category để lọc
const CATEGORIES = {
    'EXPERIENCE': ['Wellness', 'Vitality', 'Festive'],
    'DINING':    ['Breakfast', 'Lunch', 'Afternoon', 'Dinner'],
    'DISCOVER':   ['Nature', 'Heritage', 'Trend'],
};

const CATEGORY_LABELS = {
    'Wellness': 'Sức khoẻ', 'Vitality': 'Thể thao', 'Festive': 'Lễ hội',
    'Breakfast': 'Bữa sáng', 'Lunch': 'Bữa trưa', 'Afternoon': 'Bữa chiều', 'Dinner': 'Bữa tối',
    'Nature': 'Khám phá thiên nhiên', 'Heritage': 'Di tích', 'Trend': 'Xu hướng'
};

const PAGE_NAMES = {
    'EXPERIENCE': 'Trải Nghiệm',
    'DINING': 'Ẩm Thực',
    'DISCOVER': 'Khám Phá'
};

const adminPathMap = {
    'EXPERIENCE': 'trai-nghiem',
    'DINING': 'am-thuc',
    'DISCOVER': 'kham-pha'
};

const ServiceManager = ({ pageType }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Badge màu sắc cho từng loại trang
  const PAGE_THEME = {
    'EXPERIENCE': 'text-purple-700 bg-purple-50 border-purple-100',
    'DINING': 'text-orange-700 bg-orange-50 border-orange-100',
    'DISCOVER': 'text-teal-700 bg-teal-50 border-teal-100'
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      // Gọi API lấy list (đã có logic lọc Type ở backend)
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/api/v1/full-service/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: pageType, 
          search: searchTerm
        }
      });

      if (response.data.success) {
        let data = response.data.data;
        // Lọc Client-side cho Category con (nếu admin chọn filter)
        if (filterCategory !== 'ALL') {
            data = data.filter(item => item.category === filterCategory);
        }
        setServices(data);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [pageType, searchTerm, filterCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) return;
    try {
        const token = localStorage.getItem('admin_token');
        const API_URL = import.meta.env.VITE_API_URL;
        await axios.delete(`${API_URL}/api/v1/full-service/delete-service`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { id }
        });
        fetchServices();
        alert("Đã xóa thành công!");
    } catch (error) {
        alert("Lỗi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  const basePath = `/hotel/admin/${pageType.toLowerCase()}`;

  return (
    <AdminLayout title={`Quản lý ${PAGE_NAMES[pageType]}`}>
      
      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <input 
                    type="text" 
                    placeholder={`Tìm kiếm...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            {/* Filter Category */}
            <div className="relative">
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full appearance-none pl-10 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                    <option value="ALL">Tất cả danh mục</option>
                    {CATEGORIES[pageType]?.map(cat => (
                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
                    ))}
                </select>
                <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            </div>
        </div>

        {/* Add Button */}
        <button 
            onClick={() => {
                const targetPath = adminPathMap[pageType] || pageType.toLowerCase();
                navigate(`/hotel/admin/${targetPath}/them`);
            }}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            <Plus size={16} weight="bold" />
            Thêm Mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Hình ảnh</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Tên & Danh mục</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Trạng thái</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">Giá hiển thị</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right whitespace-nowrap">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {loading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Đang tải dữ liệu...</td></tr>
                    ) : services.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Chưa có dữ liệu.</td></tr>
                    ) : (
                        services.map((svc) => (
                            <tr key={svc._id} className="hover:bg-neutral-50/50 transition-colors group">
                                <td className="p-4 w-24">
                                    <img 
                                        src={svc.gallery?.[0] || 'https://via.placeholder.com/150'} 
                                        alt={svc.title} 
                                        className="w-16 h-12 object-cover rounded-md bg-neutral-200 border border-neutral-100" 
                                    />
                                </td>
                                <td className="p-4">
                                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{svc.title}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${PAGE_THEME[pageType]}`}>
                                            {CATEGORY_LABELS[svc.category]}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                            svc.is_available 
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {svc.is_available ? 'Đang mở' : 'Đang khoá'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-medium text-neutral-600 whitespace-nowrap">
                                    {svc.details?.price || 'Liên hệ'}   
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                const targetPath = adminPathMap[pageType] || pageType.toLowerCase();
                                                navigate(`/hotel/admin/${targetPath}/sua/${svc._id}`);
                                            }}
                                            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(svc._id)}
                                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Xóa"
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

export default ServiceManager;