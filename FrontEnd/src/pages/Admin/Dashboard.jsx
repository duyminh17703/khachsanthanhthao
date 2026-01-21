import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { 
    CurrencyCircleDollar, CalendarCheck, Users, ChartLineUp, 
    ClockCounterClockwise, ArrowRight, Bed, Coffee, CheckCircle, WarningCircle 
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const navigate = useNavigate();

    const fetchStats = async () => {
      try {
          const token = localStorage.getItem('admin_token');
          // Truyền range vào query string
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await axios.get(`${API_URL}/api/v1/invoices/admin/dashboard-stats?range=${timeRange}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) setData(res.data);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => { 
        fetchStats(); 
    }, [timeRange]);

    const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
    
    // Màu sắc cho biểu đồ tròn (Room Types)
    const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const maxServiceCount = data && data.serviceStats.length > 0 
        ? Math.max(...data.serviceStats.map(s => s.count)) 
        : 1;

    if (loading) return <div className="p-10 text-center animate-pulse tracking-widest text-neutral-400">ĐANG TẢI DỮ LIỆU...</div>;
    if (!data) return null;

    return (
        <AdminLayout title="Bảng điều khiển">
            {/* 1. HEADER */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-playfair italic font-bold text-neutral-900">Tổng quan khách sạn</h2>
                    <p className="text-sm text-neutral-500 mt-1">Số liệu cập nhật mới nhất ngày hôm nay.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Hệ thống</p>
                    <p className="text-sm font-medium text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle weight="fill"/> Đang hoạt động tốt
                    </p>
                </div>
            </div>

            {/* 2. KEY METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Tổng doanh thu" 
                    value={formatPrice(data.stats.totalRevenue)} 
                    icon={<CurrencyCircleDollar size={24} weight="duotone" />}
                    color="text-emerald-600 bg-emerald-50"
                />
                <StatCard 
                    title="Đơn cần duyệt" 
                    value={data.stats.pendingBookings} 
                    icon={<CalendarCheck size={24} weight="duotone" />}
                    color="text-amber-600 bg-amber-50"
                />
                <StatCard 
                    title="Khách đang ở" 
                    value={data.stats.stayingGuests} 
                    icon={<Users size={24} weight="duotone" />}
                    color="text-blue-600 bg-blue-50"
                />
                <StatCard 
                    title="Công suất phòng" 
                    value={`${data.stats.occupancyRate}%`} 
                    icon={<ChartLineUp size={24} weight="duotone" />}
                    color="text-purple-600 bg-purple-50"
                />
            </div>

            {/* 3. CHART SECTION (Doanh thu & Phòng) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* DOANH THU CHART */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-neutral-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                          <ChartLineUp size={18} /> Doanh thu
                      </h3>
                      
                      {/* Dropdown chọn thời gian */}
                      <select 
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="text-[10px] font-bold uppercase border border-neutral-200 bg-neutral-50 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-emerald-500 transition-colors"
                      >
                          <option value="week">7 Ngày qua</option>
                          <option value="month">30 Ngày qua</option>
                          <option value="quarter">3 Tháng qua (Quý)</option>
                      </select>
                  </div>

                  <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.chartData}>
                              <defs>
                                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                              
                              {/* Điều chỉnh trục X để hiển thị đẹp hơn với dữ liệu nhiều (tháng/quý) */}
                              <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fontSize: 10, fill: '#999'}} 
                                  interval={timeRange === 'week' ? 0 : 'preserveStartEnd'} // Nếu dữ liệu nhiều thì tự động ẩn bớt nhãn
                              />
                              
                              <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                  formatter={(value) => formatPrice(value)}
                                  labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}
                              />
                              <Area 
                                  type="monotone" 
                                  dataKey="revenue" 
                                  stroke="#10b981" 
                                  strokeWidth={2} 
                                  fillOpacity={1} 
                                  fill="url(#colorRev)" 
                                  animationDuration={1000} // Thêm hiệu ứng mượt khi đổi data
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

                {/* ROOM TYPES DISTRIBUTION CHART */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col">
                    <h3 className="font-bold text-neutral-800 flex items-center gap-2 uppercase text-xs tracking-widest mb-2">
                        <Bed size={18} /> Tỷ lệ lấp đầy theo loại phòng
                    </h3>
                    <div className="flex-1 min-h-[200px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.roomTypeStats}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="occupied" // Chỉ hiển thị số phòng ĐANG CÓ KHÁCH
                                    nameKey="name"
                                >
                                    {data.roomTypeStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Text ở giữa biểu đồ tròn */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-2xl font-bold text-neutral-800">{data.stats.stayingGuests}</span>
                            <p className="text-[9px] uppercase text-neutral-400">Đơn đang ở</p>
                        </div>
                    </div>
                    
                    {/* List chi tiết nhỏ bên dưới */}
                    <div className="mt-4 space-y-2">
                         {data.roomTypeStats.slice(0, 3).map((type, idx) => (
                             <div key={idx} className="flex justify-between text-xs">
                                 <span className="text-neutral-500">{type.name}</span>
                                 <span className="font-medium">{type.occupied}/{type.total} phòng</span>
                             </div>
                         ))}
                    </div>
                </div>
            </div>

            {/* 4. SERVICES & RECENT TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* TOP SERVICES (Cột trái) */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                  <h3 className="font-bold text-neutral-800 flex items-center gap-2 uppercase text-xs tracking-widest mb-6">
                      <Coffee size={18} /> Top Dịch vụ đắt khách
                    </h3>
                    {data.serviceStats.length > 0 ? (
                        <div className="space-y-6">
                            {data.serviceStats.map((svc, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    {/* Cột Trái: Ảnh */}
                                    <div className="w-12 h-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
                                        {svc.image ? (
                                            <img 
                                                src={svc.image} 
                                                alt={svc.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <Coffee size={20} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Cột Phải: Thông tin */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            {/* Hiển thị Title lấy từ DB */}
                                            <span className="text-sm font-bold text-neutral-800 line-clamp-1" title={svc.title}>
                                                {svc.title || "Dịch vụ không tên"}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600 whitespace-nowrap ml-2">
                                                {formatPrice(svc.revenue)}
                                            </span>
                                        </div>
                                        
                                        {/* Thanh Progress */}
                                        <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-1 overflow-hidden">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                                                style={{ 
                                                    width: `${(svc.count / maxServiceCount) * 100}%` 
                                                }} 
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-neutral-400 text-right">
                                          Đã bán: <span className="font-medium text-neutral-600">{svc.count}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-neutral-400 text-sm">Chưa có dữ liệu dịch vụ</div>
                    )}
                </div>

                {/* RECENT BOOKINGS (2 Cột phải) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-neutral-50 flex justify-between items-center">
                        <h3 className="font-bold text-neutral-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                            <ClockCounterClockwise size={18} /> Đặt phòng gần đây
                        </h3>
                        <button onClick={() => navigate('/hotel/admin/invoices')} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase">
                            Xem tất cả <ArrowRight />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-400 tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Mã đơn</th>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-6 py-4">Tổng tiền</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {data.recentInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-xs">{inv.booking_code}</td>
                                        <td className="px-6 py-4 font-medium">{inv.customer_info.full_name}</td>
                                        <td className="px-6 py-4 font-serif">{formatPrice(inv.final_total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border 
                                                ${inv.status === 'ĐÃ HOÀN THÀNH' ? 'bg-green-50 text-green-700' : 
                                                  inv.status === 'ĐÃ CHECKIN' ? 'bg-blue-50 text-blue-700' :
                                                  inv.status === 'ĐÃ HUỶ' ? 'bg-red-50 text-red-700' :
                                                  'bg-amber-50 text-amber-700'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

// Component StatCard giữ nguyên
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{title}</p>
            <h4 className="text-xl font-bold text-neutral-900 mt-1">{value}</h4>
        </div>
    </div>
);

export default Dashboard;