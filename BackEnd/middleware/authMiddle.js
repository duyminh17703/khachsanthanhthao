import jwt from 'jsonwebtoken';

// Middleware xác thực người dùng đã đăng nhập chưa
export const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header (Authorization: Bearer <token>)
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Truy cập bị từ chối! Vui lòng đăng nhập." 
        });
    }

    try {
        // 2. Xác thực token bằng khoá bí mật (Lưu trong file .env)
        const secretKey = process.env.JWT_SECRET || 'YOUR_SECRET_KEY_HERE'; 
        const verified = jwt.verify(token, secretKey);

        // 3. Lưu thông tin user đã giải mã vào req.user để các route sau dùng
        req.user = verified;
        
        // 4. Cho phép đi tiếp
        next();
    } catch (error) {
        res.status(403).json({ 
            success: false, 
            message: "Token không hợp lệ hoặc đã hết hạn!" 
        });
    }
};

// Middleware kiểm tra quyền Admin (Tuỳ chọn thêm nếu muốn phân quyền chặt hơn)
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.level === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền thực hiện hành động này!" 
            });
        }
    });
};