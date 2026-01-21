import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layout/MainLayout';
import { Link } from 'react-router-dom';
import { 
    Tag, 
    Ticket, 
    ArrowRight, 
    Bed, 
    Sparkle, 
    CheckCircle, 
    Clock, 
    Gift 
} from '@phosphor-icons/react';

// Hàm format tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm format ngày
const formatDate = (dateString) => {
    if(!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN');
}

const OfferPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                // [CẬP NHẬT 1] Thêm tham số ?is_public=true để chỉ lấy Offer đang mở
                const res = await axios.get('http://localhost:3000/api/v1/offers/list?is_public=true');
                if (res.data.success) setOffers(res.data.data);
            } catch (error) {
                console.error("Lỗi tải combo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Component Loading
    if (loading) return (
        <MainLayout>
            <div className="h-screen flex items-center justify-center text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
                Đang tải ưu đãi...
            </div>
        </MainLayout>
    );

    return (
        <MainLayout>
            {/* 1. HERO SECTION */}
            <div className="bg-neutral-900 text-white pb-20 pt-32 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10">
                    <h2 className="text-lg md:text-xl font-playfair italic font-light tracking-widest text-neutral-300 mb-3">
                        Khách sạn Thanh Thảo
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        Gói Ưu Đãi Đặc Biệt
                    </h1>
                    <div className="w-20 h-px bg-white/30 mx-auto"></div>
                </div>
            </div>

            {/* 2. INTRO TEXT */}
            <div className="container mx-auto px-6 py-20 max-w-5xl text-center">
                <p className="text-lg md:text-xl italic text-neutral-800 leading-relaxed font-serif max-w-3xl mx-auto">
                    "Tận hưởng kỳ nghỉ trọn vẹn với các gói Combo được thiết kế riêng biệt. 
                    Sự kết hợp hoàn hảo giữa không gian nghỉ dưỡng đẳng cấp và những trải nghiệm ẩm thực, 
                    thư giãn tinh tế nhất tại Đà Lạt."
                </p>
            </div>

            {/* 3. OFFERS LIST */}
            <div className="bg-stone-50 py-10 pb-32">
                <div className="container mx-auto px-6 max-w-6xl">
                    {offers.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400 italic">Hiện chưa có ưu đãi nào đang diễn ra.</div>
                    ) : (
                        <div className="flex flex-col gap-16">
                            {offers.map((offer, index) => (
                                <div 
                                    key={offer._id} 
                                    className={`
                                        group bg-white flex flex-col lg:flex-row shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] 
                                        hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden
                                        ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''} 
                                    `}
                                >
                                    {/* CỘT ẢNH */}
                                    <div className="lg:w-7/12 relative overflow-hidden h-[300px] lg:h-[500px]">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img 
                                            src={offer.thumbnail} 
                                            alt={offer.title} 
                                            className="w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                        />
                                        
                                        {offer.is_featured && (
                                            <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black shadow-sm">
                                                Best Seller
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 right-0 bg-white pl-6 pt-4 pr-6 pb-4 z-20 lg:hidden">
                                            <span className="text-xl font-serif font-bold text-neutral-900">{formatPrice(offer.combo_price)}</span>
                                        </div>
                                    </div>

                                    {/* CỘT NỘI DUNG */}
                                    <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Ticket size={14} weight="fill"/> Combo Tiết Kiệm
                                            </span>
                                            {offer.valid_to && (
                                                <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                                                    <Clock size={14}/> Đến {formatDate(offer.valid_to)}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl lg:text-3xl font-playfair font-bold text-neutral-900 mb-4 group-hover:text-amber-800 transition-colors">
                                            <Link to={`/offers/${offer.slug}`}>{offer.title}</Link>
                                        </h3>

                                        <p className="text-neutral-500 font-light text-sm leading-relaxed mb-8 line-clamp-3">
                                            {offer.description}
                                        </p>

                                        {/* Includes List */}
                                        <div className="space-y-3 mb-10 border-t border-dashed border-neutral-200 pt-6">
                                            {/* Phòng */}
                                            {offer.included_rooms.slice(0, 2).map((r, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                                                    <Bed size={18} className="text-neutral-400 shrink-0"/>
                                                    <span className="font-serif italic">{r.quantity} đêm tại <span className="font-bold not-italic font-sans">{r.room_id?.title}</span></span>
                                                </div>
                                            ))}
                                            
                                            {/* [CẬP NHẬT 2] Dịch vụ: Hiển thị package_title thay vì service_id.title */}
                                            {offer.included_services.slice(0, 3).map((s, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                                                    <Sparkle size={18} className="text-amber-500 shrink-0"/>
                                                    <span className="font-serif italic">
                                                        Tặng <span className="font-bold not-italic font-sans">
                                                            {s.package_title || s.service_id?.title}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {(offer.included_rooms.length > 2 || offer.included_services.length > 3) && (
                                                <div className="text-xs text-neutral-400 pl-8 italic">+ Và nhiều ưu đãi khác</div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-neutral-100 flex items-end justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Trọn gói chỉ từ</p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-3xl font-playfair font-bold text-neutral-900">
                                                        {formatPrice(offer.combo_price)}
                                                    </span>
                                                    {offer.original_price > offer.combo_price && (
                                                        <span className="text-sm text-neutral-400 line-through decoration-neutral-300">
                                                            {formatPrice(offer.original_price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <Link 
                                                to={`/offers/${offer.slug}`}
                                                className="hidden lg:flex w-12 h-12 rounded-full border border-neutral-200 items-center justify-center text-neutral-400 hover:bg-black hover:text-white hover:border-black transition-all group/btn"
                                            >
                                                <ArrowRight size={20} className="group-hover/btn:-rotate-45 transition-transform duration-300"/>
                                            </Link>
                                        </div>
                                        
                                        <Link 
                                            to={`/offers/${offer.slug}`}
                                            className="lg:hidden mt-6 w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest text-center"
                                        >
                                            Xem Chi Tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. WHY BOOK DIRECT */}
            <div className="bg-white py-24 border-t border-neutral-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <h3 className="font-playfair text-2xl italic text-neutral-900 mb-2">Đặc quyền đặt trực tiếp</h3>
                        <div className="w-10 h-1px bg-neutral-300 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 group-hover:bg-black group-hover:text-white transition-colors duration-500"><Tag size={28} /></div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3">Giá tốt nhất</h4>
                            <p className="text-sm text-neutral-500 font-light leading-relaxed px-8">Cam kết giá tốt nhất khi đặt trực tiếp qua website, không phí ẩn.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 group-hover:bg-black group-hover:text-white transition-colors duration-500"><Gift size={28} /></div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3">Quà tặng đi kèm</h4>
                            <p className="text-sm text-neutral-500 font-light leading-relaxed px-8">Nhận ngay đồ uống chào mừng và voucher spa cho mỗi lần đặt combo.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 group-hover:bg-black group-hover:text-white transition-colors duration-500"><CheckCircle size={28} /></div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-3">Linh hoạt thay đổi</h4>
                            <p className="text-sm text-neutral-500 font-light leading-relaxed px-8">Hỗ trợ đổi ngày miễn phí (tùy thuộc vào tình trạng phòng) khi báo trước 7 ngày.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default OfferPage;