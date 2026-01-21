import mongoose from "mongoose";
import slugify from "slugify";

const RoomSchema = new mongoose.Schema({
  // --- 1. Thông tin định danh ---
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

  // --- 2. Phần Hero ---
  hero: {
    image: { type: String, required: true },
    subtitle: { type: String },
  },

  // --- 3. Phần Gallery ---
  gallery: [String],

  typeRoom: { 
    type: String, 
    enum: ['STANDARD', 'LUXURY'], // Chỉ chấp nhận 2 giá trị này
    default: 'STANDARD',
    required: true
  },

  // --- 4. Phần Details (SỬA LẠI CHỖ NÀY) ---
  details: {
    beds: [String],       
    occupancy: [String],        
    bathroom: [String], 
    otherroom: [String],   
    views: [String],
  },

  // --- 5. Phần Amenities ---
  amenities: [
    {
      group_name: { type: String, required: true },
      items: [String] 
    }
  ],

  // --- 6. Thông tin đặt phòng & Giá ---
  base_price: { type: Number },
  is_available: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false }, // Có hiện lên trang chủ không
  is_deleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Middleware tạo slug
RoomSchema.pre('save', async function() {
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

export default mongoose.model('Room', RoomSchema);