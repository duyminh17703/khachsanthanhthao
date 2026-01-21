import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { showError, showSuccess } from '../../utils/toast';
import { ArrowLeft, Plus, Trash, UploadSimple, Spinner, X, CurrencyDollar, Info } from '@phosphor-icons/react';

// Cấu hình Category
const CATEGORIES_KEYS = {
    'EXPERIENCE': ['Wellness', 'Vitality', 'Festive'],
    'DINING':    ['Breakfast', 'Lunch', 'Afternoon', 'Dinner'],
    'DISCOVER':   ['Nature', 'Heritage', 'Trend'],
};

// 2. Định nghĩa Label (để hiển thị UI)
const CATEGORY_LABELS = {
    'Wellness': 'Sức khoẻ', 'Vitality': 'Thể thao', 'Festive': 'Lễ hội',
    'Breakfast': 'Bữa sáng', 'Lunch': 'Bữa trưa', 'Afternoon': 'Bữa chiều', 'Dinner': 'Bữa tối',
    'Nature': 'Thiên nhiên', 'Heritage': 'Di tích', 'Trend': 'Xu hướng'
};

const PAGE_NAMES = {
    'EXPERIENCE': 'Trải Nghiệm',
    'DINING': 'Ẩm Thực',
    'DISCOVER': 'Khám Phá'
};

const ServiceForm = ({ pageType }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  // State khởi tạo đầy đủ
  const initialState = {
    title: '',
    type: pageType, 
    category: CATEGORIES_KEYS[pageType][0],
    gallery: [],
    description: '',
    // Details (Object phẳng)
    details: { availability: '', time_of_day: '', duration: '', price: '' },
    // Pricing (Mảng lồng nhau)
    pricing_options: [], // [{ title, description, rates: [{ label, price }] }]
    // Info (Mảng lồng nhau)
    important_info: [],  // [{ title, icon_key, items: [''] }]
    is_available: true,
    is_featured: false
  };

  const [formData, setFormData] = useState(initialState);

  // --- 1. LOAD DỮ LIỆU KHI EDIT ---
useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          // 1. Lấy token từ localStorage
          const token = localStorage.getItem('admin_token');

          // 2. Gửi request kèm Header Authorization
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.get(`${API_URL}/api/v1/full-service/admin/detail/${id}`, {
            headers: {
              Authorization: `Bearer ${token}` // QUAN TRỌNG: Phải có dòng này
            }
          });

          if (res.data.success) {
            const serverData = res.data.data;
            setFormData({
              ...initialState,
              ...serverData,
              details: { ...initialState.details, ...(serverData.details || {}) },
              pricing_options: serverData.pricing_options || [],
              important_info: serverData.important_info || []
            });
          }
        } catch (error) {
          console.error("Lỗi fetch detail:", error);
          if (error.response?.status === 401) {
            showError("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
            // navigate('/hotel/admin/login'); // Có thể chuyển hướng về trang login
          } else {
            showError("Lỗi khi tải dữ liệu dịch vụ");
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
}, [id, isEditMode]);

  // --- 2. XỬ LÝ UPLOAD ẢNH ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await axios.post(`${API_URL}/api/v1/upload`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
            setFormData(prev => ({ ...prev, gallery: [...prev.gallery, res.data.imageUrl] }));
        }
    } catch (error) { showError("Lỗi upload: " + error.message); } 
    finally { setUploading(false); e.target.value = ''; }
  };
  const removeImage = (idx) => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));

  // --- 3. XỬ LÝ FORM CƠ BẢN ---
  const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleDetailChange = (e) => {
      setFormData(prev => ({ ...prev, details: { ...prev.details, [e.target.name]: e.target.value } }));
  };

  // --- 4. XỬ LÝ PRICING OPTIONS (Nested Array) ---
  const addPricing = () => setFormData(p => ({ ...p, pricing_options: [...p.pricing_options, { title: '', description: '', rates: [{ label: '', price: '' }] }] }));
  const removePricing = (idx) => setFormData(p => ({ ...p, pricing_options: p.pricing_options.filter((_, i) => i !== idx) }));
  
  const handlePricingField = (idx, field, val) => {
      const newArr = [...formData.pricing_options];
      newArr[idx][field] = val;
      setFormData({ ...formData, pricing_options: newArr });
  };
  
  // Rate trong Pricing
  const addRate = (pIdx) => {
      const newArr = [...formData.pricing_options];
      newArr[pIdx].rates.push({ label: '', price: '' });
      setFormData({ ...formData, pricing_options: newArr });
  };
  const removeRate = (pIdx, rIdx) => {
      const newArr = [...formData.pricing_options];
      newArr[pIdx].rates = newArr[pIdx].rates.filter((_, i) => i !== rIdx);
      setFormData({ ...formData, pricing_options: newArr });
  };
  const handleRateChange = (pIdx, rIdx, field, val) => {
      const newArr = [...formData.pricing_options];
      newArr[pIdx].rates[rIdx][field] = val;
      setFormData({ ...formData, pricing_options: newArr });
  };

  // --- 5. XỬ LÝ IMPORTANT INFO (Nested Array) ---
  const addInfoGroup = () => setFormData(p => ({ ...p, important_info: [...p.important_info, { title: '', icon_key: 'info', items: [''] }] }));
  const removeInfoGroup = (idx) => setFormData(p => ({ ...p, important_info: p.important_info.filter((_, i) => i !== idx) }));
  
  const handleInfoTitle = (idx, val) => {
      const newArr = [...formData.important_info];
      newArr[idx].title = val;
      setFormData({ ...formData, important_info: newArr });
  };
  
  const addInfoItem = (gIdx) => {
      const newArr = [...formData.important_info];
      newArr[gIdx].items.push('');
      setFormData({ ...formData, important_info: newArr });
  };
  const removeInfoItem = (gIdx, iIdx) => {
      const newArr = [...formData.important_info];
      newArr[gIdx].items = newArr[gIdx].items.filter((_, i) => i !== iIdx);
      setFormData({ ...formData, important_info: newArr });
  };
  const handleInfoItem = (gIdx, iIdx, val) => {
      const newArr = [...formData.important_info];
      newArr[gIdx].items[iIdx] = val;
      setFormData({ ...formData, important_info: newArr });
  };

  // --- 6. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
        const API_URL = import.meta.env.VITE_API_URL;
        const url = isEditMode ? `${API_URL}/api/v1/full-service/update-service` : `${API_URL}/api/v1/full-service/add-service`;
        const method = isEditMode ? 'put' : 'post';
        const payload = isEditMode ? { ...formData, id } : formData;

        await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } });
        showSuccess("Lưu dữ liệu thành công!");
        navigate(`/hotel/admin/${pageType.toLowerCase()}`);
    } catch (error) {
        showError("Lỗi: " + (error.response?.data?.message || error.message));
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout title={`${isEditMode ? 'Cập nhật' : 'Thêm mới'} ${PAGE_NAMES[pageType]}`}>
        <div className="max-w-6xl mx-auto pb-24 relative">
            
            {/* Input File Ẩn */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            {/* Loading Upload */}
            {uploading && (
                <div className="fixed inset-0 bg-black/30 z-999 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <Spinner className="animate-spin text-black" size={24} /> <span className="font-bold">Đang tải ảnh...</span>
                    </div>
                </div>
            )}

            <button onClick={() => navigate(`/hotel/admin/${pageType.toLowerCase()}`)} className="flex items-center gap-2 text-neutral-500 hover:text-black mb-6 text-sm font-medium">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. THÔNG TIN CHUNG */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Thông tin cơ bản</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="accent-black w-4 h-4"/>
                                <span className="text-xs font-bold uppercase">Mở</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="accent-black w-4 h-4"/>
                                <span className="text-xs font-bold uppercase text-orange-600">Nổi bật</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="label-admin">Tên dịch vụ *</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="input-admin" placeholder="VD: Sunset Dinner..." />
                        </div>
                        <div>
                            <label className="label-admin">Phân loại chi tiết *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="input-admin">
                                {CATEGORIES_KEYS[pageType].map(key => (
                                    <option key={key} value={key}>
                                        {CATEGORY_LABELS[key]} {/* Hiển thị tiếng Việt */}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-admin">Mô tả giới thiệu</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="input-admin h-24" placeholder="Mô tả ngắn gọn về dịch vụ..." />
                        </div>
                    </div>
                </div>

                {/* 2. THƯ VIỆN ẢNH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-2">Hình ảnh ({formData.gallery.length})</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                        {formData.gallery.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                    <X size={14} weight="bold" />
                                </button>
                            </div>
                        ))}
                        <div onClick={() => fileInputRef.current.click()} className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-black transition-all group">
                            <UploadSimple size={24} className="text-neutral-400 group-hover:text-black mb-1" />
                            <span className="text-[10px] font-bold uppercase text-neutral-400 group-hover:text-black">Tải ảnh</span>
                        </div>
                    </div>
                </div>

                {/* 3. CHI TIẾT VẬN HÀNH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-2">Thông số vận hành</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="label-admin">Lịch hoạt động</label>
                            <input name="availability" value={formData.details.availability} onChange={handleDetailChange} className="input-admin" placeholder="VD: Hàng ngày" />
                        </div>
                        <div>
                            <label className="label-admin">Khung giờ</label>
                            <input name="time_of_day" value={formData.details.time_of_day} onChange={handleDetailChange} className="input-admin" placeholder="VD: 14:00 - 22:00" />
                        </div>
                        <div>
                            <label className="label-admin">Thời lượng</label>
                            <input name="duration" value={formData.details.duration} onChange={handleDetailChange} className="input-admin" placeholder="VD: 2 Tiếng" />
                        </div>
                        <div>
                            <label className="label-admin">Giá hiển thị</label>
                            <input name="price" value={formData.details.price} onChange={handleDetailChange} className="input-admin" placeholder="VD: Từ 500.000 VND" />
                        </div>
                    </div>
                </div>

                {/* 4. BẢNG GIÁ CHI TIẾT (PRICING OPTIONS) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <div className="flex items-center gap-2">
                             <CurrencyDollar size={20} className="text-neutral-400"/>
                             <h3 className="text-sm font-bold uppercase tracking-widest">Các gói dịch vụ & Giá</h3>
                        </div>
                        <button type="button" onClick={addPricing} className="btn-mini"><Plus size={12} /> Thêm gói</button>
                    </div>
                    
                    <div className="space-y-6">
                        {formData.pricing_options.length === 0 && <p className="text-sm text-neutral-400 italic text-center py-4">Chưa có gói giá nào.</p>}
                        
                        {formData.pricing_options.map((option, pIdx) => (
                            <div key={pIdx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/30 relative">
                                <button type="button" onClick={() => removePricing(pIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"><Trash size={18}/></button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                                    <div>
                                        <label className="label-admin">Tên gói</label>
                                        <input value={option.title} onChange={(e) => handlePricingField(pIdx, 'title', e.target.value)} className="input-admin font-bold" placeholder="VD: Một mình vẫn ổn..." />
                                    </div>
                                    <div>
                                        <label className="label-admin">Mô tả gói</label>
                                        <input value={option.description} onChange={(e) => handlePricingField(pIdx, 'description', e.target.value)} className="input-admin" placeholder="VD: Dành cho 2 người" />
                                    </div>
                                </div>

                                {/* RATES */}
                                <div className="pl-4 border-l-2 border-neutral-300 space-y-2">
                                    <div className="text-[10px] font-bold uppercase text-neutral-400 mb-2">Bảng giá chi tiết</div>
                                    {option.rates.map((rate, rIdx) => (
                                        <div key={rIdx} className="flex gap-2 items-center">
                                            <input value={rate.label} onChange={(e) => handleRateChange(pIdx, rIdx, 'label', e.target.value)} className="input-admin py-1.5 text-xs flex-1" placeholder="VD: GÓI CƠ BẢN..." />
                                            <input value={rate.price} onChange={(e) => handleRateChange(pIdx, rIdx, 'price', e.target.value)} className="input-admin py-1.5 text-xs w-32" placeholder="Giá tiền" />
                                            <button type="button" onClick={() => removeRate(pIdx, rIdx)} className="text-neutral-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addRate(pIdx)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2">+ Thêm mức giá</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. THÔNG TIN CẦN BIẾT (IMPORTANT INFO) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Info size={20} className="text-neutral-400"/>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Thông tin cần biết</h3>
                        </div>
                        <button type="button" onClick={addInfoGroup} className="btn-mini"><Plus size={12} /> Thêm nhóm</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.important_info.length === 0 && <div className="col-span-2 text-sm text-neutral-400 italic text-center">Chưa có thông tin thêm.</div>}

                        {formData.important_info.map((info, idx) => (
                            <div key={idx} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 relative">
                                <button type="button" onClick={() => removeInfoGroup(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash size={16}/></button>
                                
                                <div className="mb-3 pr-6">
                                    <label className="label-admin">Tiêu đề nhóm</label>
                                    <input value={info.title} onChange={(e) => handleInfoTitle(idx, e.target.value)} className="input-admin font-bold" placeholder="VD: Cần mang theo..." />
                                </div>

                                <div className="space-y-2">
                                    {info.items.map((item, iIdx) => (
                                        <div key={iIdx} className="flex gap-1 items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                                            <input value={item} onChange={(e) => handleInfoItem(idx, iIdx, e.target.value)} className="input-admin py-1 text-xs" placeholder="Nội dung..." />
                                            <button type="button" onClick={() => removeInfoItem(idx, iIdx)} className="text-neutral-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addInfoItem(idx)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 ml-2">+ Thêm dòng</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg text-sm sticky bottom-4 z-10">
                    {loading ? 'Đang lưu dữ liệu...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Dịch Vụ Mới')}
                </button>
            </form>
        </div>
    </AdminLayout>
  );
};

export default ServiceForm;