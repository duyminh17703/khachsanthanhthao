import express from 'express';
import Cart from '../models/Cart.js';
import Room from '../models/Room.js';
import Offer from '../models/Offer.js';

const cartRouter = express.Router();

cartRouter.post('/add-to-cart', async (req, res) => {
    try {
        const { userId, type, itemId, ...data } = req.body; 
        
        let itemInfo = {};
        let calculatedPrice = 0;

        // --- BƯỚC 1: CHUẨN BỊ DỮ LIỆU MỚI (NEW ITEM) ---
        
        // CASE 1: ROOM (Giữ nguyên)
        if (type === 'ROOM') {
            const room = await Room.findById(itemId);
            if (!room) return res.status(404).json({ success: false, message: "Phòng không tồn tại" });
            
            const start = new Date(data.checkIn);
            const end = new Date(data.checkOut);
            const nights = Math.ceil((end - start) / (1000 * 3600 * 24));
            
            if (nights < 1) return res.status(400).json({ success: false, message: "Ngày không hợp lệ" });

            calculatedPrice = room.base_price * nights;
            
            itemInfo = {
                type: 'ROOM',
                itemId: room._id,
                title: room.title,
                slug: room.slug, // Slug của phòng (nếu cần link tới)
                image: room.hero?.image || "",
                price: room.base_price,
                totalPrice: calculatedPrice,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                nights: nights
            };
        } 
        
        // [MỚI] CASE 2: OFFER (COMBO)
        else if (type === 'OFFER') {
            const offer = await Offer.findById(itemId);
            if (!offer) return res.status(404).json({ success: false, message: "Ưu đãi không tồn tại" });

            // Offer thường có giá cố định (combo_price)
            // Nếu muốn nhân theo số lượng combo đặt:
            let qty = data.quantity || 1;
            calculatedPrice = offer.combo_price * qty;

            // Tính số đêm (chỉ để hiển thị, không nhân vào giá nếu giá combo là trọn gói)
            const start = new Date(data.checkIn);
            const end = new Date(data.checkOut);
            const nights = Math.ceil((end - start) / (1000 * 3600 * 24));

            itemInfo = {
                type: 'OFFER',
                itemId: offer._id,
                title: offer.title,
                slug: offer.slug, // Slug của offer
                image: offer.thumbnail || "",
                price: offer.combo_price,
                totalPrice: calculatedPrice,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                nights: nights, // Lưu lại để hiển thị "3 ngày 2 đêm"
                quantity: qty
            };
        }

        // CASE 3: SERVICE / DINING / DISCOVER (Logic chung)
        else {   
            const unitPrice = data.price || 0; 
            let qty = data.quantity || 1;
            
            if (type === 'SERVICE' && data.dates && Array.isArray(data.dates)) {
                 calculatedPrice = unitPrice * data.dates.length * qty; 
            } else {
                 calculatedPrice = unitPrice * qty;
            }
            
            itemInfo = {
                type: type, 
                itemId: itemId,
                title: data.title,
                image: data.image,
                price: unitPrice,
                totalPrice: data.totalPrice || calculatedPrice, 
                quantity: qty,
                note: data.note,
                bookingDate: data.bookingDate, 
                bookingTime: data.bookingTime,
                dates: data.dates,             
                bookingCode: data.bookingCode,
                packageTitle: data.packageTitle,
                rateLabel: data.rateLabel
            };
        }

        // --- BƯỚC 2: TƯƠNG TÁC VỚI GIỎ HÀNG ---
        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [], totalAmount: 0 });

        // Logic thay thế item cũ nếu trùng (áp dụng cho ROOM và OFFER)
        if (type === 'ROOM' || type === 'OFFER') {
            const existingIndex = cart.items.findIndex(item => 
                item.itemId.toString() === itemId && item.type === type
            );
            // Nếu khách đặt lại cùng 1 combo/phòng -> Xóa cái cũ đi cập nhật cái mới (Logic đổi ngày)
            if (existingIndex > -1) {
                cart.items.splice(existingIndex, 1);
            }
        }

        // BƯỚC 3: THÊM ITEM MỚI VÀO
        cart.items.push(itemInfo);
        
        // Tính lại tổng tiền cả giỏ
        cart.totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        await cart.save();
        res.json({ success: true, message: "Đã cập nhật giỏ hàng", cart });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

cartRouter.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.json({ success: true, cart: cart || { items: [], totalAmount: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

cartRouter.post('/remove-to-cart', async (req, res) => { 
    try {
        const { userId, itemId } = req.body;

        // Tìm giỏ hàng của user
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
        }

        // --- CÁCH CHUYÊN NGHIỆP: Dùng hàm .pull() của Mongoose ---
        // Hàm này tự động tìm sub-document có _id trùng với itemId và xóa nó đi
        // Nó xử lý luôn việc convert String sang ObjectId, không lo lỗi so sánh
        cart.items.pull(itemId); 

        // Tính lại tổng tiền sau khi xóa
        cart.totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
        
        // Lưu lại thay đổi
        await cart.save();

        res.json({ success: true, message: "Đã xóa thành công", cart });

    } catch (error) {
        console.error(error); // Log lỗi ra terminal để dễ debug
        res.status(500).json({ success: false, message: error.message });
    }
});

cartRouter.delete('/clear/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];         // Xóa sạch mảng items
            cart.totalAmount = 0;    // Reset tổng tiền
            await cart.save();
        }

        res.json({ success: true, message: "Đã làm trống giỏ hàng" });
    } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default cartRouter;