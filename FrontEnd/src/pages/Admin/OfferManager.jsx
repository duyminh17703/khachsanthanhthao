import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Plus, MagnifyingGlass, Trash, PencilSimple, Ticket, CalendarBlank } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { showSuccess, showError, showConfirm } from '../../utils/toast';

const OfferManager = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOffers = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API_URL}/api/v1/offers/list`);
            if (res.data.success) {
                setOffers(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách ưu đãi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirm("Bạn có chắc chắn muốn xóa ưu đãi này không?");
        if (!isConfirmed) return;

        try {
            // [QUAN TRỌNG] Lấy token để xác thực admin
            const token = localStorage.getItem('admin_token'); 
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const API_URL = import.meta.env.VITE_API_URL;
            // Gửi request kèm config
            await axios.delete(`${API_URL}/api/v1/offers/delete/${id}`, config); 
            
            showSuccess("Đã xóa ưu đãi thành công!");
            setOffers(offers.filter(offer => offer._id !== id));
        } catch (error) {
            console.error(error);
            showError("Không thể xóa ưu đãi này (Lỗi xác thực hoặc Server).");
        }
    };

    const filteredOffers = offers.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <AdminLayout title="Quản Lý Ưu Đãi">
            {/* Header */}
                <div className="flex justify-end items-center mb-8">
                    <Link to="/hotel/admin/uu-dai/them" className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                        <Plus size={18} weight="bold" /> Thêm Combo Mới
                    </Link>
                </div>

                {/* Filter & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                        />
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                        Tổng: {filteredOffers.length} Combo
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOffers.map((offer) => (
                            <div key={offer._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                                {/* Thumbnail */}
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={offer.thumbnail} 
                                        alt={offer.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {offer.is_featured && (
                                        <span className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                                            Nổi bật
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={offer.title}>
                                        {offer.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            <Ticket size={14} className="text-gray-700"/> 
                                            {offer.included_rooms.length} Phòng
                                        </span>
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            <Ticket size={14} className="text-gray-700"/> 
                                            {offer.included_services.length} Dịch vụ
                                        </span>
                                    </div>

                                    <div className="flex items-end gap-2 mb-4">
                                        <span className="text-xl font-serif font-bold text-amber-700">
                                            {formatPrice(offer.combo_price)}
                                        </span>
                                        {offer.original_price > offer.combo_price && (
                                            <span className="text-sm text-gray-400 line-through mb-1">
                                                {formatPrice(offer.original_price)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${offer.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {offer.is_available ? 'Đang hoạt động' : 'Tạm ẩn'}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link 
                                                to={`/hotel/admin/uu-dai/sua/${offer._id}`}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <PencilSimple size={20} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(offer._id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </AdminLayout>
    );
};

export default OfferManager;