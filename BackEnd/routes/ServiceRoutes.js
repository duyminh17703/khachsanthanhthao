import express from 'express';
import Service from '../models/Service.js';
import { verifyToken } from '../middleware/authMiddle.js';

const ServiceRouter = express.Router();

const VALID_CATEGORIES = {
    'EXPERIENCE': ['Wellness', 'Vitality', 'Festive'],
    'DINING':    ['Breakfast', 'Lunch', 'Afternoon', 'Dinner'],
    'DISCOVER':   ['Nature', 'Heritage', 'Trend'],
};


ServiceRouter.post('/add-service',verifyToken, async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ Body theo Schema MỚI
        const { 
            title, 
            type, 
            category, 
            gallery,      // Thay cho hero_image
            description,  // Thay cho short/long description
            details,
            pricing_options,
            important_info
        } = req.body;

        // 2. Validation cơ bản: Các trường bắt buộc
        // Lưu ý: gallery không bắt buộc trong schema, nhưng nên có ít nhất 1 ảnh
        if (!title || !type || !category) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đủ: Tên, Loại và Danh mục." 
            });
        }

        // 3. Validation Logic: Kiểm tra Type
        if (!VALID_CATEGORIES[type]) {
            return res.status(400).json({ 
                success: false, 
                message: `Type '${type}' không hợp lệ.` 
            });
        }

        // 4. Validation Logic: Kiểm tra Category thuộc Type
        if (!VALID_CATEGORIES[type].includes(category)) {
            return res.status(400).json({ 
                success: false, 
                message: `Danh mục '${category}' không thuộc loại dịch vụ '${type}'.` 
            });
        }

        // 5. Khởi tạo đối tượng mới theo Schema MỚI
        const newService = new Service({
            title,
            type,
            category,
            gallery: gallery || [], // Mảng ảnh
            description,            // Mô tả chung
            details,                // Object { availability, time_of_day... }
            pricing_options,        // Array
            important_info,         // Array
            is_available: true,
            is_featured: false
        });

        // 6. Lưu vào Database
        await newService.save();

        res.status(201).json({ 
            success: true, 
            message: 'Thêm dịch vụ mới thành công!',
            data: newService
        });

    } catch (error) {
        console.error("Lỗi thêm service:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Tên dịch vụ này đã tồn tại (trùng slug)." 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

ServiceRouter.get('/admin/detail/:id', verifyToken, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ" });
        res.json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.put('/update-service', verifyToken, async (req, res) => {
    try {
        const { id, ...updateData } = req.body;

        // Validation cơ bản nếu đổi loại
        if (updateData.type && updateData.category) {
            if (!VALID_CATEGORIES[updateData.type]?.includes(updateData.category)) {
                 return res.status(400).json({ 
                    success: false, 
                    message: `Danh mục '${updateData.category}' không khớp với loại '${updateData.type}'` 
                });
            }
        }

        const service = await Service.findByIdAndUpdate(id, updateData, { new: true });

        if (!service) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
        }

        res.json({ success: true, message: "Cập nhật thành công!", data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.delete('/delete-service',verifyToken, async (req, res) => {
    try {
        const { id } = req.body;
        // Xóa cứng (Hard Delete) hoặc Xóa mềm tùy bạn. 
        // Schema của bạn chưa có is_deleted nên mình dùng xóa cứng.
        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
        }

        res.json({ success: true, message: "Đã xóa dịch vụ thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.get('/admin/list', verifyToken, async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = { type: type }; // Lọc theo type (EXPERIENCE, DINING, DISCOVER)

        if (search) {
            // Tìm kiếm gần đúng theo tiêu đề
            query.title = { $regex: search, $options: 'i' };
        }

        // ĐẢM BẢO dùng đúng tên biến Model đã import ở đầu file (ví dụ: Service)
        const services = await Service.find(query).sort({ createdAt: -1 }); 
        
        res.json({ success: true, data: services });
    } catch (error) {
        // Trả về lỗi 500 kèm tin nhắn chi tiết để debug
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.get('/list-by-type', async (req, res) => {
    try {
        const { type } = req.query; // Nhận ?type=EXPERIENCE từ frontend

        // Validate type có nằm trong danh sách hợp lệ không
        if (!type || !VALID_CATEGORIES[type]) {
            return res.status(400).json({ success: false, message: "Loại dịch vụ không hợp lệ" });
        }

        const services = await Service.find({ 
            type: type,
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: `Lấy danh sách ${type} thành công`,
            count: services.length,
            data: services
        });

    } catch (error) {
        console.error(`Lỗi lấy danh sách ${type}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.get('/feature-by-type', async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ success: false, message: "Thiếu tham số type" });
        }

        // Tìm các dịch vụ có type tương ứng, đang bật is_featured và is_available
        const services = await Service.find({ 
            type: type.toUpperCase(),
            is_featured: true,
            is_available: true
        })
        .select('title slug description details gallery')
        .limit(3);

        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.get('/list-all-for-offer', async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

ServiceRouter.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Tìm dịch vụ theo slug và đảm bảo chưa bị xóa (nếu có logic xóa mềm)
        const service = await Service.findOne({ slug: slug });

        if (!service) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ này." });
        }

        res.json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default ServiceRouter;