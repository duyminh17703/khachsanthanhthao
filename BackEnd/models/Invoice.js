import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  // ... (Các phần booking_code, customer_info giữ nguyên)
  booking_code: { type: String, required: true, unique: true, uppercase: true },
  
  customer_info: {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    special_requests: { type: String }
  },

  // --- 3. CHI TIẾT PHÒNG / COMBO ---
  booked_rooms: [
    {
      room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
      is_combo: { type: Boolean, default: false },

      room_title: { type: String, required: true },
      
      // [MỚI] Lưu ảnh thumbnail (của phòng hoặc của combo)
      room_thumbnail: { type: String }, 

      check_in: { type: Date, required: true },
      check_out: { type: Date, required: true },
      primary_guest_name: { type: String },
      
      status: {
        type: String,
        enum: ['CHỜ CHECKIN', 'ĐÃ CHECKIN', 'HUỶ'],
        default: 'CHỜ CHECKIN'
      },

      price_per_night: { type: Number, required: true },
      total_nights: { type: Number, required: true },
      total_room_price: { type: Number, required: true }
    }
  ],

  // --- 4. CHI TIẾT DỊCH VỤ ---
  booked_services: [
    {
      service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, 
      service_title: { type: String, required: true },
      
      // [MỚI] Lưu ảnh thumbnail dịch vụ
      service_thumbnail: { type: String },

      service_dates: [{ type: Date }],
      service_type: { type: String, enum: ['DINING', 'EXPERIENCE', 'DISCOVER'] },
      date: { type: Date },
      time_slot: { type: String },
      selected_package: { type: String },
      selected_rate_label: { type: String },
      unit_price: { type: Number, required: true },
      total_service_price: { type: Number, required: true }
    }
  ],

  payment_method: { 
      type: String, 
      enum: ['CASH', 'VNPAY', 'MOMO'], 
      default: 'CASH' 
  },
  is_paid: { type: Boolean, default: false }, // Đã thanh toán chưa
  transaction_ref: { type: String },

  final_total: { type: Number, required: true },
  status: {
    type: String,
    enum: [
        'CHỜ XÁC NHẬN',              // Tiền mặt: Mới đặt
        'CHỜ THANH TOÁN ONLINE',     // Online: Mới đặt, chưa thanh toán
        'ĐÃ XÁC NHẬN-CHỜ CHECKIN',   // Tiền mặt: Lễ tân đã xác nhận
        'ĐÃ THANH TOÁN-CHỜ CHECKIN', // Online: Đã thanh toán xong
        'ĐÃ CHECKIN',                // Khách đang ở (chung cho cả 2)
        'ĐÃ HOÀN THÀNH',             // Đã xong xuôi tất cả
        'ĐÃ HUỶ'
    ],
    default: 'CHỜ XÁC NHẬN'
  },
}, { timestamps: true });

export default mongoose.model('Invoice', InvoiceSchema);