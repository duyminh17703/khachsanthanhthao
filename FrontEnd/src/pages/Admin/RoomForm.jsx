import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { showError, showSuccess } from "../../utils/toast";
import { ArrowLeft, Plus, Trash, UploadSimple, Spinner, X } from '@phosphor-icons/react';

  const DynamicInput = ({ label, values, onChange, onAdd, onRemove }) => (
    <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">{label}</label>
        {values.map((val, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={val} onChange={(e) => onChange(idx, e.target.value)} className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm focus:border-black focus:outline-none" placeholder={`Mục ${idx + 1}...`} />
                <button type="button" onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 px-2"><Trash size={16}/></button>
            </div>
        ))}
        <button type="button" onClick={onAdd} className="text-[10px] font-bold uppercase text-blue-600 hover:underline flex items-center gap-1"><Plus size={12}/> Thêm dòng</button>
    </div>
  );

const RoomForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Ref input file
  const fileInputRef = useRef(null);
  const uploadTarget = useRef({ type: null }); 

  const initialState = {
    title: '',
    typeRoom: 'STANDARD',
    base_price: 0,
    hero: { image: '', subtitle: '' },
    gallery: [],
    details: {
      beds: [''], occupancy: [''], bathroom: [''], otherroom: [''], views: [''],
    },
    amenities: [ { group_name: 'Tiện ích chung', items: [''] } ],
    is_available: true,
    is_featured: false
  };

  const [formData, setFormData] = useState(initialState);

  // Load dữ liệu khi Edit
  useEffect(() => {
    if (isEditMode) {
      const fetchRoom = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.get(`${API_URL}/api/v1/rooms/list-rooms`); 
          const roomToEdit = res.data.data.find(r => r._id === id);
          if (roomToEdit) {
             setFormData({
                ...initialState, 
                ...roomToEdit,
                details: { ...initialState.details, ...(roomToEdit.details || {}) },
                amenities: roomToEdit.amenities?.length > 0 ? roomToEdit.amenities : initialState.amenities,
                gallery: roomToEdit.gallery || []
             });
          }
        } catch (error) {
          console.error("Lỗi tải phòng:", error);
        }
      };
      fetchRoom();
    }
  }, [id, isEditMode]);

  // --- LOGIC UPLOAD ---
  const triggerUpload = (type) => {
    uploadTarget.current = { type };
    fileInputRef.current.click();
  };

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
            const imageUrl = res.data.imageUrl;
            const { type } = uploadTarget.current;

            if (type === 'hero') {
                setFormData(prev => ({ ...prev, hero: { ...prev.hero, image: imageUrl } }));
            } else if (type === 'gallery') {
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, imageUrl] }));
            }
        }
    } catch (error) {
        showError("Lỗi upload ảnh: " + error.message);
    } finally {
        setUploading(false);
        e.target.value = ''; 
    }
  };

  const removeHeroImage = () => setFormData(prev => ({ ...prev, hero: { ...prev.hero, image: '' } }));
  const removeGalleryImage = (idx) => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, hero: { ...prev.hero, [name]: value } }));
  };
  
  const handleArrayChange = (field, index, value, parentField = null) => {
     setFormData(prev => {
        const newArray = [...prev[parentField][field]];
        newArray[index] = value;
        return { ...prev, [parentField]: { ...prev[parentField], [field]: newArray } };
     });
  };
  const addArrayItem = (field, parentField = null) => {
     setFormData(prev => {
        return { ...prev, [parentField]: { ...prev[parentField], [field]: [...prev[parentField][field], ''] } };
     });
  };
  const removeArrayItem = (field, index, parentField = null) => {
      setFormData(prev => {
        const newArray = prev[parentField][field].filter((_, i) => i !== index);
        return { ...prev, [parentField]: { ...prev[parentField], [field]: newArray } };
      });
  };

  // Amenities Handlers
  const handleAmenityGroupTitleChange = (gIdx, val) => {
      const newAm = [...formData.amenities]; newAm[gIdx].group_name = val; setFormData({...formData, amenities: newAm});
  };
  const addAmenityGroup = () => setFormData({...formData, amenities: [...formData.amenities, {group_name:'', items:['']}]});
  const removeAmenityGroup = (gIdx) => setFormData({...formData, amenities: formData.amenities.filter((_,i)=>i!==gIdx)});
  const handleAmenityItemChange = (gIdx, iIdx, val) => {
      const newAm = [...formData.amenities]; newAm[gIdx].items[iIdx] = val; setFormData({...formData, amenities: newAm});
  };
  const addAmenityItem = (gIdx) => {
      const newAm = [...formData.amenities]; newAm[gIdx].items.push(''); setFormData({...formData, amenities: newAm});
  };
  const removeAmenityItem = (gIdx, iIdx) => {
      const newAm = [...formData.amenities]; newAm[gIdx].items = newAm[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, amenities: newAm});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
        const url = isEditMode ? 'http://localhost:3000/api/v1/rooms/update-room' : 'http://localhost:3000/api/v1/rooms/add-room';
        const method = isEditMode ? 'put' : 'post';
        const payload = isEditMode ? { ...formData, id } : formData;
        await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } });
        showSuccess("Lưu thành công!");
        navigate('/hotel/admin/rooms');
    } catch (error) {
        showError("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEditMode ? "Cập nhật phòng" : "Thêm phòng mới"}>
        <div className="max-w-5xl mx-auto pb-20 relative">
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            {uploading && (
                <div className="fixed inset-0 bg-black/30 z-999 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-short">
                        <Spinner className="animate-spin text-black" size={24} />
                        <span className="text-sm font-bold text-neutral-800">Đang tải ảnh lên...</span>
                    </div>
                </div>
            )}

            <button onClick={() => navigate('/hotel/admin/rooms')} className="flex items-center gap-2 text-neutral-500 hover:text-black mb-6 text-sm font-medium">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. KHUNG ẢNH HERO (GIỮ NGUYÊN) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                         <h3 className="text-sm font-bold uppercase tracking-widest">Thông tin chung</h3>
                         <div className="flex gap-6">
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
                        <div className="md:row-span-4">
                            <label className="label-admin">Ảnh Bìa</label>
                            {formData.hero.image ? (
                                <div className="relative w-full h-93 rounded-lg overflow-hidden group border border-neutral-200">
                                    <img src={formData.hero.image} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <button type="button" onClick={removeHeroImage} className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                        <Trash size={18} weight="bold" />
                                    </button>
                                </div>
                            ) : (
                                <div onClick={() => triggerUpload('hero')} className="w-full h-64 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-black transition-all group">
                                    <div className="p-4 bg-neutral-100 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all"><UploadSimple size={32} className="text-neutral-400 group-hover:text-black" /></div>
                                    <span className="text-xs font-bold uppercase text-neutral-400 group-hover:text-black tracking-widest">Tải ảnh bìa</span>
                                </div>
                            )}
                        </div>
                        <div><label className="label-admin">Tên phòng *</label><input name="title" value={formData.title} onChange={handleChange} required className="input-admin" placeholder="VD: Presidential Suite" /></div>
                        <div>
                            <label className="label-admin">Loại phòng</label>
                            <select name="typeRoom" value={formData.typeRoom} onChange={handleChange} className="input-admin">
                                <option value="STANDARD">STANDARD</option>
                                <option value="LUXURY">LUXURY</option>
                            </select>
                        </div>
                        <div><label className="label-admin">Giá cơ bản (VND) *</label><input type="number" name="base_price" value={formData.base_price} onChange={handleChange} required className="input-admin" /></div>
                        <div><label className="label-admin">Mô tả ngắn</label><textarea name="subtitle" value={formData.hero.subtitle} onChange={handleHeroChange} className="input-admin h-24" placeholder="Mô tả ngắn gọn..." /></div>
                    </div>
                </div>

                {/* 2. GALLERY (GIỮ NGUYÊN) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-2">Thư viện ảnh ({formData.gallery.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.gallery.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-md shadow-sm hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <X size={14} weight="bold" />
                                </button>
                            </div>
                        ))}
                        <div onClick={() => triggerUpload('gallery')} className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-black transition-all group">
                            <Plus size={24} className="text-neutral-400 group-hover:text-black mb-1" />
                            <span className="text-[10px] font-bold uppercase text-neutral-400 group-hover:text-black">Thêm ảnh</span>
                        </div>
                    </div>
                </div>

                {/* 3. DETAILS (SỬA THÀNH FORM NGANG) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-2">Chi tiết phòng</h3>
                    {/* Chia thành 3 cột (md:grid-cols-3) thay vì 2 cột bé như cũ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DynamicInput label="Phòng ngủ" values={formData.details.beds} onChange={(i,v) => handleArrayChange('beds', i, v, 'details')} onAdd={() => addArrayItem('beds', 'details')} onRemove={(i) => removeArrayItem('beds', i, 'details')} />
                        <DynamicInput label="Sức chứa tối đa" values={formData.details.occupancy} onChange={(i,v) => handleArrayChange('occupancy', i, v, 'details')} onAdd={() => addArrayItem('occupancy', 'details')} onRemove={(i) => removeArrayItem('occupancy', i, 'details')} />
                        <DynamicInput label="Phòng tắm" values={formData.details.bathroom} onChange={(i,v) => handleArrayChange('bathroom', i, v, 'details')} onAdd={() => addArrayItem('bathroom', 'details')} onRemove={(i) => removeArrayItem('bathroom', i, 'details')} />
                        <DynamicInput label="Tầm nhìn" values={formData.details.views} onChange={(i,v) => handleArrayChange('views', i, v, 'details')} onAdd={() => addArrayItem('views', 'details')} onRemove={(i) => removeArrayItem('views', i, 'details')} />
                        <DynamicInput label="Các phòng khác" values={formData.details.otherroom} onChange={(i,v) => handleArrayChange('otherroom', i, v, 'details')} onAdd={() => addArrayItem('otherroom', 'details')} onRemove={(i) => removeArrayItem('otherroom', i, 'details')} />
                    </div>
                </div>
                    
                {/* 4. AMENITIES (SỬA THÀNH FORM NGANG) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Tiện ích</h3>
                        <button type="button" onClick={addAmenityGroup} className="bg-neutral-100 hover:bg-neutral-200 text-black px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1"><Plus size={12} /> Thêm nhóm</button>
                    </div>
                    {/* Chia các nhóm tiện ích thành 2 cột (md:grid-cols-2) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.amenities.map((group, gIdx) => (
                            <div key={gIdx} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 h-fit">
                                <div className="flex gap-2 mb-2 items-center">
                                    <input type="text" value={group.group_name} onChange={(e) => handleAmenityGroupTitleChange(gIdx, e.target.value)} className="w-full bg-white border border-neutral-300 font-bold px-2 py-1.5 rounded text-xs focus:border-black focus:outline-none" placeholder="Tên nhóm (VD: Công nghệ)..."/>
                                    <button type="button" onClick={() => removeAmenityGroup(gIdx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash size={16}/></button>
                                </div>
                                <div className="pl-2 border-l-2 border-neutral-200 space-y-2">
                                    {group.items.map((item, iIdx) => (
                                        <div key={iIdx} className="flex gap-1">
                                            <input type="text" value={item} onChange={(e) => handleAmenityItemChange(gIdx, iIdx, e.target.value)} className="flex-1 bg-white border border-neutral-200 px-2 py-1 rounded text-xs focus:border-black focus:outline-none" placeholder="Tiện ích..."/>
                                            <button type="button" onClick={() => removeAmenityItem(gIdx, iIdx)} className="text-neutral-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addAmenityItem(gIdx)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Plus size={10}/> Thêm dòng</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-6 left-0 right-0 z-30 mt-12">
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg text-sm">
                    {loading ? 'Đang lưu dữ liệu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo phòng mới')}
                </button>
                </div>
            </form>
        </div>
    </AdminLayout>
  );
};

export default RoomForm;