import express from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/authMiddle.js';

const adminRouter = express.Router();

adminRouter.post('/add-account', async (req, res) => {
    try {
        const { username, password, level } = req.body;

        // Validation cơ bản
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đầy đủ Username và Password" 
            });
        }

        // 1. Kiểm tra xem username đã tồn tại chưa
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false, 
                message: "Tên đăng nhập này đã được sử dụng." 
            });
        }

        // 2. Mã hóa mật khẩu (Bắt buộc để bảo mật)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Tạo tài khoản mới
        // Nếu không truyền 'level', mặc định schema sẽ lấy là 'EMPLOYEE'
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            level: level || 'EMPLOYEE' 
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: "Tạo tài khoản thành công!",
            data: {
                _id: newAdmin._id,
                username: newAdmin.username,
                level: newAdmin.level
            }
        });

    } catch (error) {
        console.error("Lỗi tạo admin:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

adminRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ 
                success: false, 
                message: "Sai tên đăng nhập hoặc mật khẩu" 
            });
        }

        // --- BẮT ĐẦU ĐOẠN MỚI ---
        // Tạo Token chứa ID và Level
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(
            { id: admin._id, level: admin.level }, 
            secretKey, 
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày
        );
        // --- KẾT THÚC ĐOẠN MỚI ---

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: token, // <--- Trả về token cho Client
            data: {
                _id: admin._id,
                username: admin.username,
                level: admin.level
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

adminRouter.get('/list', verifyToken, async (req, res) => {
    try {
        // Chỉ lấy user có level là EMPLOYEE (không lấy ADMIN khác để bảo mật)
        const employees = await Admin.find({ level: 'EMPLOYEE' }).select('-password'); 
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- [MỚI] 2. XOÁ NHÂN VIÊN ---
adminRouter.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra quyền (chỉ ADMIN mới xoá được - logic này có thể check trong middleware hoặc ở đây)
        if (req.user.level !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Không có quyền thực hiện." });
        }

        await Admin.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xoá nhân viên." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- [MỚI] 3. CẬP NHẬT NHÂN VIÊN (ĐỔI PASSWORD) ---
adminRouter.put('/update', verifyToken, async (req, res) => {
    try {
        const { id, username, password } = req.body;

        if (req.user.level !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Không có quyền thực hiện." });
        }

        const existingAdmin = await Admin.findOne({ username, _id: { $ne: id } });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập này đã có người sử dụng!" });
        }

        let updateData = { username };

        // Nếu có gửi password mới thì mới hash và cập nhật
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        
        res.json({ success: true, message: "Cập nhật thành công!", data: updatedAdmin });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default adminRouter;