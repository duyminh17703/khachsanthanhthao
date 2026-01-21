import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { 
    Users, Plus, Trash, PencilSimple, 
    Key, MagnifyingGlass, X, CheckCircle 
} from '@phosphor-icons/react';
import { showSuccess, showError, showConfirm } from '../../utils/toast';

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: '', username: '', password: '' });

    // --- 1. LẤY DỮ LIỆU ---
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API_URL}/api/v1/admin/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setEmployees(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // --- 2. XỬ LÝ FORM (THÊM / SỬA) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token');

        try {
            if (isEditMode) {
                // Cập nhật
                const API_URL = import.meta.env.VITE_API_URL;
                const res = await axios.put(`${API_URL}/api/v1/admin/update`, {
                    id: formData.id,
                    username: formData.username,
                    password: formData.password // Nếu rỗng backend sẽ bỏ qua
                }, { headers: { Authorization: `Bearer ${token}` } });
                
                if (res.data.success) showSuccess("Cập nhật thành công!");

            } else {
                // Thêm mới (Dùng API add-account cũ)
                const API_URL = import.meta.env.VITE_API_URL;
                const res = await axios.post(`${API_URL}/api/v1/admin/add-account`, {
                    username: formData.username,
                    password: formData.password,
                    level: 'EMPLOYEE'
                }); 
                
                if (res.data.success) showSuccess("Thêm nhân viên thành công!");
            }

            setShowModal(false);
            fetchEmployees();
            setFormData({ id: '', username: '', password: '' });

        } catch (error) {
            showError(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // --- 3. XỬ LÝ XOÁ ---
    const handleDelete = async (id) => {
        const confirm = await showConfirm("Bạn chắc chắn muốn xoá nhân viên này?");
        if (!confirm) return;

        try {
            const token = localStorage.getItem('admin_token');
            const API_URL = import.meta.env.VITE_API_URL;
            await axios.delete(`${API_URL}/api/v1/admin/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess("Đã xoá nhân viên.");
            setEmployees(employees.filter(e => e._id !== id));
        } catch (error) {
            showError("Lỗi khi xoá: " + error.message);
        }
    };

    // --- 4. CÁC HÀM HỖ TRỢ UI ---
    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ id: '', username: '', password: '' });
        setShowModal(true);
    };

    const openEditModal = (emp) => {
        setIsEditMode(true);
        setFormData({ id: emp._id, username: emp.username, password: '' }); // Password để trống
        setShowModal(true);
    };

    const filteredList = employees.filter(e => e.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <AdminLayout title="Quản Lý Nhân Viên">
            
            {/* TOOLBAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-6 flex justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên đăng nhập..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                    />
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                </div>
                
                <button 
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-lg hover:-translate-y-0.5"
                >
                    <Plus size={16} weight="bold" /> Thêm Nhân Viên
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 w-16 text-center">STT</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Tên đăng nhập</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Chức vụ</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Ngày tạo</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Đang tải dữ liệu...</td></tr>
                        ) : filteredList.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-neutral-400">Chưa có nhân viên nào.</td></tr>
                        ) : (
                            filteredList.map((emp, index) => (
                                <tr key={emp._id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="p-4 text-center text-neutral-400 text-xs font-mono">{index + 1}</td>
                                    <td className="p-4 font-bold text-neutral-900 text-sm">{emp.username}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100">
                                            {emp.level === 'EMPLOYEE' ? 'Nhân viên' : emp.level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-neutral-500">
                                        {new Date(emp._id.getTimestamp ? emp._id.getTimestamp() : Date.now()).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(emp)}
                                                className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Đổi mật khẩu"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(emp._id)}
                                                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xoá"
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

            {/* --- MODAL THÊM / SỬA --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                {isEditMode ? <PencilSimple className="text-blue-600"/> : <Plus className="text-green-600"/>}
                                {isEditMode ? 'Cập Nhật Tài Khoản' : 'Thêm Nhân Viên Mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-red-500 transition-colors">
                                <X size={20} weight="bold" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className={`w-full p-3 border rounded-lg outline-none focus:border-black transition-colors ${isEditMode ? 'bg-neutral-100 text-neutral-500' : 'bg-white'}`}
                                    placeholder="Nhập username..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                                    {isEditMode ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        required={!isEditMode} 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full p-3 border border-neutral-200 rounded-lg outline-none focus:border-black transition-colors pl-10"
                                        placeholder="******"
                                    />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18}/>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-neutral-100 text-neutral-600 font-bold rounded-lg hover:bg-neutral-200 transition-colors">
                                    Huỷ
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors shadow-lg">
                                    {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default EmployeeManager;