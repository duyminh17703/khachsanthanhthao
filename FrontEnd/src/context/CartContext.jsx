import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    
    const userId = sessionStorage.getItem('guest_user_id') || 'guest_' + Date.now();
    if (!sessionStorage.getItem('guest_user_id')) {
        sessionStorage.setItem('guest_user_id', userId);
    }

    // 1. Load giỏ hàng
    const fetchCart = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API_URL}/api/v1/cart/${userId}`);
            if (res.data.success) setCart(res.data.cart);
        } catch (error) {
            console.error("Lỗi tải giỏ hàng", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // 2. Hàm thêm vào giỏ
    const addToCart = async (payload) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${API_URL}/api/v1/cart/add-to-cart`, {
                userId, 
                ...payload 
            });
            
            if (res.data.success) {
                setCart(res.data.cart);
                setIsCartOpen(true); // Mở sidebar lên để user thấy
            }
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
            alert("Lỗi: " + (error.response?.data?.message || "Không thể thêm vào giỏ"));
        }
    };

    // 3. Hàm xóa item
    const removeFromCart = async (itemId) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${API_URL}/api/v1/cart/remove-to-cart`, { 
                userId, 
                itemId 
            });
            
            if (res.data.success) {
                setCart(res.data.cart);
            }
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
            alert("Không thể xóa sản phẩm, vui lòng thử lại.");
        }
    };

    // 4. [MỚI] Hàm xóa toàn bộ giỏ hàng (Reset state)
    const clearCart = async () => {
        try {
            // 1. Cập nhật State ngay lập tức để UI phản hồi nhanh
            setCart({ items: [], totalAmount: 0 });
            setIsCartOpen(false); // Đóng sidebar nếu đang mở

            // 2. Gọi API để xóa trong Database
            const API_URL = import.meta.env.VITE_API_URL;
            await axios.delete(`${API_URL}/api/v1/cart/clear/${userId}`);
            
        } catch (error) {
            console.error("Lỗi khi clear giỏ hàng database:", error);
            // Không cần alert lỗi ở đây để tránh làm phiền trải nghiệm người dùng khi họ đã thanh toán xong
        }
    };

    return (
        <CartContext.Provider value={{ 
            isCartOpen, 
            setIsCartOpen, 
            cart, 
            addToCart, 
            removeFromCart,
            clearCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);