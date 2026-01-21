import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      // 1. Định danh loại dịch vụ
      type: { 
        type: String, 
        enum: ['ROOM', 'DINING', 'DISCOVER', 'EXPERIENCE','OFFER'], 
        required: true 
      },
      
      // 2. ID tham chiếu chung (có thể là RoomID, ServiceID, FoodID...)
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      
      // 3. Thông tin hiển thị (Snapshot)
      title: String,
      image: String,
      slug: String,
      
      // 4. Giá tiền
      price: Number,      // Giá đơn vị (1 đêm, 1 vé, 1 suất ăn)
      totalPrice: Number, // Tổng tiền item này
      
      // 5. Các trường đặc thù (Optional)
      // Dành cho ROOM
      checkIn: Date,
      checkOut: Date,
      nights: Number,
      
      // Dành cho DINING / DISCOVER / SERVICE
      bookingDate: Date,  // Ngày đặt bàn / Ngày đi tour
      // --- [THÊM MỚI] CHO SERVICE (DỊCH VỤ) ---
      dates: [Date],        // Mảng các ngày đã chọn
      bookingCode: String,  // Mã đặt phòng liên kết
      packageTitle: String, // Tên gói (VD: Gói Sức Khỏe)
      rateLabel: String,

    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;