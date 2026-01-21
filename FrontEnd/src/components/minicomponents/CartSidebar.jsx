import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cart, removeFromCart } = useCart();
    const navigate = useNavigate();

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    
    // Helper format ngày: Chuyển string hoặc Date về format dd/mm
    const formatDateShort = (dateInput) => {
            if (!dateInput) return '';
            // Ép kiểu về Date object bất kể đầu vào là string hay object
            const date = new Date(dateInput); 
            if (isNaN(date.getTime())) return ''; 
            
            const day = `0${date.getDate()}`.slice(-2);
            const month = `0${date.getMonth() + 1}`.slice(-2);
            return `${day}/${month}`;
        };

        const getTypeBadge = (type) => {
        switch(type) {
            case 'ROOM': return 'PHÒNG';
            case 'OFFER': return 'ƯU ĐÃI';
            default: return 'DỊCH VỤ';
        }
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-60 transition-opacity duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsCartOpen(false)}
            ></div>

            <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-70 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-neutral-100 bg-white sticky top-0 z-10">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Giỏ hàng của bạn</h2>
                    <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-black transition-colors text-2xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 h-[calc(100vh-200px)]">
                    {cart.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                            <p className="text-xs uppercase tracking-widest">Giỏ hàng đang trống</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {cart.items.map((item, index) => ( // Thêm index để làm key fallback
                                <div key={item._id || index} className="flex gap-5 group relative">
                                    <div 
                                        onClick={() => handleNavigateToDetail(item)}
                                        className="w-28 h-20 overflow-hidden bg-neutral-100 shrink-0 rounded-sm cursor-pointer"
                                    >
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-200 px-1.5 py-0.5 rounded-sm mb-1 block w-fit ${item.type === 'OFFER' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}`}>
                                                {getTypeBadge(item.type)}
                                            </span>
                                            <button onClick={() => removeFromCart(item._id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>

                                        <h3 
                                            onClick={() => handleNavigateToDetail(item)}
                                            className="text-[13px] font-bold uppercase tracking-wide text-neutral-900 truncate cursor-pointer hover:text-neutral-600 transition-colors"
                                        >
                                            {item.title}
                                        </h3>

                                        <div className="mt-2 text-[11px] text-neutral-500 font-serif italic space-y-1">
                                            {/* HIỂN THỊ CHO PHÒNG (Giữ nguyên) */}
                                                {(item.type === 'ROOM' || item.type === 'OFFER') && (
                                                <>
                                                    <p className="leading-relaxed mb-1">
                                                        <span className="font-semibold text-black">
                                                            {item.nights} đêm: 
                                                        </span> {formatDateShort(item.checkIn)} — {formatDateShort(item.checkOut)}
                                                    </p>
                                                </>
                                                )}
                                            {item.type !== 'ROOM' && item.dates && item.dates.length > 0 && (
                                                <>
                                                    {/* Dòng 1: Số ngày + Các ngày cụ thể */}
                                                    <p className="leading-relaxed mb-1">
                                                        <span className="font-semibold text-black">{item.dates.length} ngày: </span>
                                                        {item.dates.map(date => formatDateShort(date)).join(', ')}
                                                    </p>
                                                    
                                                    {/* Dòng 2: Tên gói + Tên hạng (Rate) */}
                                                    {(item.packageTitle || item.rateLabel) && (
                                                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                                            Tên gói: <span className="font-semibold text-neutral-500">{item.packageTitle}</span> - 
                                                            {item.rateLabel && <span> {item.rateLabel}</span>}
                                                        </p>
                                                    )}

                                                    {/* Dòng 3: Mã đặt phòng */}
                                                    {item.bookingCode && (
                                                        <div className="flex items-center flex-wrap gap-2 mt-1 pt-1 border-t border-neutral-100 border-dashed">
                                                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[9px] font-sans font-bold text-neutral-500 border border-neutral-200">
                                                                Mã hoá đơn: #{item.bookingCode.replace('FS-', '')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>                                        
                                        <p className="text-sm font-bold text-neutral-900 mt-2 text-right">
                                            {formatPrice(item.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                    <div className="absolute bottom-0 left-0 w-full bg-white border-t border-neutral-100 p-8">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Tổng cộng (VND)</span>
                            <div className="text-right">
                                <span className="block text-2xl font-serif text-neutral-900 leading-none">
                                    {formatPrice(cart.totalAmount)}
                                </span>
                                <span className="text-[10px] text-neutral-400 italic">Đã bao gồm thuế & phí</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                navigate('/thanh-toan');
                            }}
                            className="w-full bg-black text-white h-14 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 cursor-pointer transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <span>Thanh toán ngay</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"/></svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;