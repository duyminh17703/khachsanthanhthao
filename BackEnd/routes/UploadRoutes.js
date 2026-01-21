import express from 'express';
import multer from 'multer'; 
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const uploadRouter = express.Router();

// 1. Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cấu hình Multer (Nơi lưu tạm ảnh trước khi up)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hotel_booking', // Tên folder trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage });

// 3. API Upload
// Route: POST /api/v1/upload
uploadRouter.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Chưa chọn file ảnh" });
        }
        // Trả về đường dẫn ảnh online
        res.json({ 
            success: true, 
            message: "Upload thành công", 
            imageUrl: req.file.path 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default uploadRouter;