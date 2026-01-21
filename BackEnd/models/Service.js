import mongoose from "mongoose";
import slugify from "slugify";

const ServiceSchema = new mongoose.Schema({
  // =========================================================
  // 1. ĐỊNH DANH & PHÂN LOẠI
  // =========================================================
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Loại dịch vụ chính (Cha)
  type: {
    type: String,
    required: true,
    enum: ['DINING', 'EXPERIENCE', 'DISCOVER'], 
    index: true
  },

  // Phân loại chi tiết (Con) - Mới thêm vào
  category: {
    type: String,
    required: true,
    enum: [
        // Thuộc EXPERIENCE
        'Wellness', 'Vitality', 'Festive',
        // Thuộc DINING
        'Breakfast', 'Lunch', 'Afternoon', 'Dinner',
        // Thuộc DISCOVER
        'Nature', 'Heritage', 'Trend',
    ]
  },

  // =========================================================
  // 2. HÌNH ẢNH & MÔ TẢ
  // =========================================================
  gallery: [String],                            // Mảng ảnh slide
  description: { type: String },           // Hiện ở trang chi tiết (Overview dài)

  // =========================================================
  // 3. THÔNG SỐ VẬN HÀNH (DETAILS GRID)
  // =========================================================
  // Phần hiển thị tóm tắt nằm ngang ở giữa trang
  details: {
    availability: { type: String }, // Vd: "All year round", "Mon, Wed, Fri"
    time_of_day: { type: String },  // Vd: "2:00 PM", "Morning"
    duration: { type: String },     // Vd: "30 Mins", "5 Hours"
    price: { type: String },        // Vd: "COMPLIMENTARY", "From VND 945,000"
  },

  // =========================================================
  // 4. BẢNG GIÁ CHI TIẾT (CHO POPUP "ALL PRICES")
  // =========================================================
  // Dùng khi dịch vụ có nhiều gói (Rental vs Lesson)
  pricing_options: [
    {
      title: { type: String, required: true }, // Vd: "BODYBOARD RENTAL"
      description: { type: String },           // Vd: "1 hour • Up to 8 people"
      rates: [
        {
          label: { type: String, required: true }, // Vd: "ADULTS (6+)"
          price: { type: String, required: true }  // Vd: "COMPLIMENTARY"
        }
      ]
    }
  ],

  // =========================================================
  // 5. THÔNG TIN QUAN TRỌNG (THINGS TO KNOW)
  // =========================================================
  // Linh hoạt tùy theo loại dịch vụ (Menu, Quy định, Cần mang theo...)
  important_info: [
    {
      // Key để Frontend map ra icon tương ứng (vd: 'info', 'clothes', 'calendar', 'utensils')
      icon_key: { type: String, default: 'info' }, 
      title: { type: String, required: true }, // Vd: "What to Bring", "Cancellation Policy"
      items: [String]                          // Mảng các dòng gạch đầu dòng
    }
  ],

  // =========================================================
  // 6. TRẠNG THÁI & ACTION
  // =========================================================
  is_available: { type: Boolean, default: true },  // Hiện nút "Check Availability" hay không
  is_featured: { type: Boolean, default: false }, // Có hiện lên trang chủ không
}, {
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// --- MIDDLEWARE: TỰ ĐỘNG TẠO SLUG ---
ServiceSchema.pre('save', async function() {
  // Nếu title không thay đổi thì thoát luôn
  if (!this.isModified('title')) return;

  try {
    // Tạo slug
    this.slug = slugify(this.title, { lower: true, strict: true });
  } catch (error) {
    console.log("Lỗi tạo slug:", error);
    // Nếu muốn chặn lưu khi lỗi slug thì throw error ở đây
  }
});

export default mongoose.model('Service', ServiceSchema);