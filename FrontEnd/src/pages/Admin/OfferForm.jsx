import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadSimple, Plus, X, Tag, CalendarBlank } from '@phosphor-icons/react';
import axios from 'axios';
import { showSuccess, showError } from '../../utils/toast';

// --- HELPERS ---
const formatCurrencyVN = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

const parsePrice = (priceString) => {
    if (!priceString) return 0;
    if (typeof priceString === 'number') return priceString;
    return parseInt(priceString.toString().replace(/\D/g, ''), 10) || 0;
};

const OfferForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);

    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        combo_price: '',
        original_price: 0,
        is_available: true,
        is_featured: false,
        thumbnail: '',
        banner: '',
        valid_from: '',
        valid_to: '',
        included_rooms: [],     
        included_services: []   
    });

    // States tạm cho việc chọn phòng/dịch vụ
    const [tempRoomId, setTempRoomId] = useState('');
    const [tempRoomQty, setTempRoomQty] = useState(1);

    const [tempServiceId, setTempServiceId] = useState('');
    const [tempPackageTitle, setTempPackageTitle] = useState('');
    const [tempRateLabel, setTempRateLabel] = useState('');
    const [availablePackages, setAvailablePackages] = useState([]);
    const [availableRates, setAvailableRates] = useState([]);

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('admin_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const roomsRes = await axios.get('http://localhost:3000/api/v1/rooms/list-rooms', config);
                if (roomsRes.data.success) setAvailableRooms(roomsRes.data.data);

                const servicesRes = await axios.get('http://localhost:3000/api/v1/full-service/list-all-for-offer', config); 
                if (servicesRes.data.success) setAvailableServices(servicesRes.data.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }

            if (isEditMode) {
                try {
                    const offerRes = await axios.get(`http://localhost:3000/api/v1/offers/${id}`);
                    if (offerRes.data.success) {
                        const data = offerRes.data.data;
                        setFormData({
                            ...data,
                            valid_from: formatDateForInput(data.valid_from),
                            valid_to: formatDateForInput(data.valid_to),
                            included_rooms: data.included_rooms.map(r => ({
                                room_id: r.room_id?._id || r.room_id,
                                quantity: r.quantity
                            })),
                            // Map lại dữ liệu cũ vào form
                            included_services: data.included_services.map(s => ({
                                service_id: s.service_id?._id || s.service_id,
                                package_title: s.package_title,
                                label: s.label,   // [CHANGED] label_price -> label
                                price: s.price,   // [ADDED] Load lại giá đã lưu
                                note: s.note || ''
                            }))
                        });
                    }
                } catch (error) { showError("Lỗi tải chi tiết"); }
            }
        };
        fetchData();
    }, [id, isEditMode]);

    // 2. Tự động tính Original Price (Tổng giá trị thực)
    useEffect(() => {
        let total = 0;
        // Tính tiền phòng
        formData.included_rooms.forEach(item => {
            const room = availableRooms.find(r => r._id === item.room_id);
            if (room) total += (room.base_price * item.quantity);
        });
        
        // Tính tiền dịch vụ (Dùng giá đã lưu trong included_services)
        formData.included_services.forEach(item => {
             total += (item.price || 0);
        });
        
        setFormData(prev => ({ ...prev, original_price: total }));
    }, [formData.included_rooms, formData.included_services, availableRooms]);

    // 3. Logic Dropdown Dịch vụ
    useEffect(() => {
        if (!tempServiceId) {
            setAvailablePackages([]); setTempPackageTitle(''); return;
        }
        const selected = availableServices.find(s => s._id === tempServiceId);
        if (selected?.pricing_options) {
            setAvailablePackages(selected.pricing_options);
            if (selected.pricing_options.length > 0) setTempPackageTitle(selected.pricing_options[0].title);
        }
    }, [tempServiceId, availableServices]);

    useEffect(() => {
        const pkg = availablePackages.find(p => p.title === tempPackageTitle);
        if (pkg?.rates) {
            setAvailableRates(pkg.rates);
            if (pkg.rates.length > 0) setTempRateLabel(pkg.rates[0].label);
        } else {
            setAvailableRates([]); setTempRateLabel('');
        }
    }, [tempPackageTitle, availablePackages]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('image', file);
        try {
            const res = await axios.post('http://localhost:3000/api/v1/upload', uploadData);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, [field]: res.data.imageUrl }));
                showSuccess("Upload ảnh thành công");
            }
        } catch (error) { showError("Lỗi upload ảnh"); }
    };

    const addRoomToList = () => {
        if (!tempRoomId) return showError("Vui lòng chọn phòng");
        if (formData.included_rooms.find(r => r.room_id === tempRoomId)) return showError("Phòng đã có trong danh sách");
        setFormData(prev => ({
            ...prev,
            included_rooms: [...prev.included_rooms, { room_id: tempRoomId, quantity: Number(tempRoomQty) }]
        }));
        setTempRoomId(''); setTempRoomQty(1);
    };

    // [QUAN TRỌNG] Hàm thêm dịch vụ: Lấy cả Price và Label
    const addServiceToList = () => {
        if (!tempServiceId || !tempPackageTitle || !tempRateLabel) return showError("Chọn đủ dịch vụ, gói và mức giá");

        // Tìm lại object rate gốc để lấy giá tiền
        const service = availableServices.find(s => s._id === tempServiceId);
        const pkg = service?.pricing_options?.find(p => p.title === tempPackageTitle);
        const rate = pkg?.rates?.find(r => r.label === tempRateLabel);
        
        const priceValue = rate ? parsePrice(rate.price) : 0;

        setFormData(prev => ({
            ...prev,
            included_services: [...prev.included_services, { 
                service_id: tempServiceId, 
                package_title: tempPackageTitle,
                label: tempRateLabel, // Lưu tên gói (VD: ADULTS)
                price: priceValue,    // Lưu giá tiền (VD: 500000)
                note: ''
            }]
        }));
        setTempServiceId(''); // Reset sau khi thêm
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token'); 
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = isEditMode 
                ? 'http://localhost:3000/api/v1/offers/update' 
                : 'http://localhost:3000/api/v1/offers/add';
            const payload = isEditMode ? { ...formData, id } : formData;

            const response = await axios[isEditMode ? 'put' : 'post'](url, payload, config);
            if (response.data.success) {
                showSuccess(isEditMode ? "Cập nhật thành công!" : "Tạo ưu đãi thành công!");
                navigate('/hotel/admin/offers');
            }
        } catch (error) {
            console.error("Lỗi Submit:", error);
            showError(error.response?.data?.message || "Lỗi xử lý dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const getRoomName = (id) => availableRooms.find(r => r._id === id)?.title || id;
    const getServiceName = (id) => availableServices.find(s => s._id === id)?.title || id;

    const discountPercent = formData.original_price > 0 
        ? Math.round(((formData.original_price - formData.combo_price) / formData.original_price) * 100) 
        : 0;

    return (
        <AdminLayout title={isEditMode ? 'Chỉnh Sửa Ưu Đãi' : 'Thêm Ưu Đãi Mới'}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/hotel/admin/offers')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditMode ? 'Cập nhật ưu đãi' : 'Tạo mới ưu đãi'}</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Quản lý các gói dịch vụ combo</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Thông tin cơ bản */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b pb-2 flex items-center gap-2"><Tag size={18} /> Thông tin cơ bản</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên Combo ưu đãi</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black" placeholder="VD: Combo Mùa Hè..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Giá Combo (VNĐ)</label>
                                        <input required type="number" name="combo_price" value={formData.combo_price} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black font-bold text-amber-700" placeholder="8500000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Giá Trị Thực (Tự động tính)</label>
                                        <div className="w-full p-3 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 font-bold">{formatCurrencyVN(formData.original_price)}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><CalendarBlank size={16} /> Ngày bắt đầu</label>
                                        <input type="date" name="valid_from" value={formData.valid_from} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><CalendarBlank size={16} /> Ngày kết thúc</label>
                                        <input type="date" name="valid_to" value={formData.valid_to} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                                    </div>
                                </div>
                                {discountPercent > 0 && (
                                    <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-center gap-2 text-green-700">
                                        <Tag size={18} weight="fill" /><span className="text-xs font-bold uppercase tracking-wider">Khách hàng tiết kiệm được {discountPercent}%</span>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
                                    <textarea required rows={3} name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="Mô tả..." />
                                </div>
                            </div>
                        </div>

                        {/* 2. Cấu hình Combo */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b pb-2">Cấu hình chi tiết Combo</h3>
                            
                            {/* Chọn Phòng */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-900 mb-3 text-[11px] uppercase tracking-wider">1. Loại Phòng áp dụng</label>
                                <div className="flex gap-2 mb-3">
                                    <select className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none" value={tempRoomId} onChange={(e) => setTempRoomId(e.target.value)}>
                                        <option value="">-- Chọn loại phòng --</option>
                                        {availableRooms.map(r => (<option key={r._id} value={r._id}>{r.title} ({formatCurrencyVN(r.base_price)})</option>))}
                                    </select>
                                    <button type="button" onClick={addRoomToList} className="bg-black text-white px-6 rounded-lg font-bold text-xs uppercase hover:bg-gray-800 transition-colors">Thêm</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.included_rooms.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <span className="text-sm font-medium">{getRoomName(item.room_id)}</span>
                                            <button type="button" onClick={() => setFormData(p=>({...p, included_rooms: p.included_rooms.filter((_,i)=>i!==idx)}))} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chọn Dịch Vụ - UI Updated */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 text-[11px] uppercase tracking-wider">2. Dịch vụ đi kèm</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                                    <select className="p-3 border border-gray-200 rounded-lg outline-none text-sm" value={tempServiceId} onChange={(e) => setTempServiceId(e.target.value)}>
                                        <option value="">-- Chọn Dịch vụ --</option>
                                        {availableServices.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                                    </select>
                                    <select className="p-3 border border-gray-200 rounded-lg outline-none text-sm disabled:bg-gray-100" value={tempPackageTitle} onChange={(e) => setTempPackageTitle(e.target.value)} disabled={!tempServiceId}>
                                        <option value="">-- Gói --</option>
                                        {availablePackages.map((pkg, i) => <option key={i} value={pkg.title}>{pkg.title}</option>)}
                                    </select>
                                    <select className="p-3 border border-gray-200 rounded-lg outline-none text-sm disabled:bg-gray-100" value={tempRateLabel} onChange={(e) => setTempRateLabel(e.target.value)} disabled={!tempPackageTitle}>
                                        <option value="">-- Mức giá --</option>
                                        {availableRates.map((r, i) => <option key={i} value={r.label}>{r.label} ({r.price})</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={addServiceToList} className="w-full bg-gray-100 text-black py-2.5 rounded-lg hover:bg-gray-200 font-bold text-[10px] uppercase mb-3 transition-colors">+ Thêm Dịch Vụ Này Vào Combo</button>
                                
                                {/* Danh sách dịch vụ đã chọn - Hiển thị chi tiết hơn */}
                                <div className="space-y-2">
                                    {formData.included_services.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{getServiceName(item.service_id)}</span>
                                                <span className="text-[10px] text-amber-700 font-bold uppercase">
                                                    {item.package_title} • {item.label} • {formatCurrencyVN(item.price)}
                                                </span>
                                            </div>
                                            <button type="button" onClick={() => setFormData(p=>({...p, included_services: p.included_services.filter((_,i)=>i!==idx)}))} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={18}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 3. Trạng thái & Ảnh - Giữ nguyên */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b pb-2">Cài đặt hiển thị</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="w-5 h-5 accent-black" /><span className="text-sm font-medium group-hover:text-black transition-colors">Cho phép hoạt động</span></label>
                                <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 accent-black" /><span className="text-sm font-medium group-hover:text-black transition-colors">Đưa vào mục Nổi bật</span></label>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b pb-2">Hình ảnh truyền thông</h3>
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Ảnh đại diện</label>
                                <div className="relative w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden hover:border-black transition-all group">
                                    {formData.thumbnail ? <img src={formData.thumbnail} className="w-full h-full object-cover" alt="thumb" /> : <UploadSimple size={24} className="text-gray-300" />}
                                    <input type="file" onChange={(e) => handleUpload(e, 'thumbnail')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Ảnh Banner</label>
                                <div className="relative w-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden hover:border-black transition-all group">
                                    {formData.banner ? <img src={formData.banner} className="w-full h-full object-cover" alt="banner" /> : <UploadSimple size={24} className="text-gray-300" />}
                                    <input type="file" onChange={(e) => handleUpload(e, 'banner')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400">
                            {loading ? "Vui lòng đợi..." : isEditMode ? "Cập nhật Ưu Đãi" : "Lưu & Xuất bản Combo"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default OfferForm;