import mongoose from "mongoose";
import slugify from "slugify";

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String },
  thumbnail: { type: String },
  banner: { type: String },

  combo_price: { type: Number, required: true },
  original_price: { type: Number, default: 0 },
  
  valid_from: { type: Date },
  valid_to: { type: Date },

  included_rooms: [
    {
      room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
      quantity: { type: Number, default: 1 }
    }
  ],

  // [CẬP NHẬT] Khớp với OfferForm
  included_services: [
    {
      service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      package_title: { type: String },
      label: { type: String },    // VD: "ADULTS (6+)"
      price: { type: Number },    // VD: 500000
    }
  ],

  is_available: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

OfferSchema.pre('save', async function() {
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

export default mongoose.model('Offer', OfferSchema);