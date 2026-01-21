import express from 'express';
import Room from '../models/Room.js';
import Invoice from '../models/Invoice.js';
import Offer from '../models/Offer.js';
import { verifyToken } from '../middleware/authMiddle.js';

const roomRouter = express.Router();

// Route thêm phòng mới
roomRouter.post('/add-room', verifyToken, async (req, res) => {
    try {
        const roomData = new Room(req.body);
        await roomData.save();  
        
        res.status(201).json({ 
            success: true, 
            message: 'Thêm phòng thành công!',
            data: roomData
        });

    } catch (error) {
        console.log(error);
        res.json({ 
            success: false, 
            message: error.message
        });
    }
});

// Route cập nhật phòng theo ID
roomRouter.put('/update-room', verifyToken, async (req, res) => {
    try {
        // Lấy ID và các dữ liệu cần sửa từ req.body
        const { id, ...updateData } = req.body;

        // 1. Tìm phòng theo ID
        const room = await Room.findById(id);

        // Nếu không tìm thấy
        if (!room) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy phòng này trong hệ thống." 
            });
        }

        // 2. Cập nhật dữ liệu mới vào bản ghi cũ
        // Object.assign sẽ ghi đè các trường có trong updateData vào room
        Object.assign(room, updateData);

        // 3. Lưu lại
        // Hành động này sẽ kích hoạt Middleware pre('save') để cập nhật lại Slug nếu bạn có sửa Title
        await room.save();

        res.json({ 
            success: true, 
            message: "Cập nhật phòng thành công!",
            data: room 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// API Xóa Mềm (Chỉ ẩn đi)
roomRouter.delete('/delete-room', verifyToken, async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Thiếu ID" });
        }

        // Thay vì findByIdAndDelete, ta dùng findByIdAndUpdate
        const hiddenRoom = await Room.findByIdAndUpdate(
            id, 
            { 
                is_deleted: true,     // Đánh dấu là đã xóa
                is_available: false,  // Tắt luôn trạng thái sẵn sàng cho chắc
                is_featured: false    // Bỏ khỏi mục nổi bật
            },
            { new: true } // Trả về data mới sau khi update
        );

        if (!hiddenRoom) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
        }

        res.json({ 
            success: true, 
            message: "Đã chuyển phòng vào thùng rác thành công!",
            data: hiddenRoom 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Lấy danh sách phòng
roomRouter.get('/', async (req, res) => {
    try {
        // 1. Lấy tham số từ URL (Frontend gửi lên)
        const { type, search } = req.query;

        // 2. Khởi tạo bộ lọc mặc định (Luôn loại bỏ phòng đã xóa)
        let query = { is_deleted: false };

        // 3. Nếu có lọc theo Loại phòng (Và không phải là ALL)
        if (type && type !== 'ALL') {
            query.typeRoom = type; 
        }

        // 4. Nếu có tìm kiếm theo Tên (Dùng Regex để tìm gần đúng, không phân biệt hoa thường)
        if (search) {
            // $regex: tìm chuỗi con, $options: 'i' là case-insensitive (không phân biệt hoa thường)
            query.title = { $regex: search, $options: 'i' };
        }

        // 5. Thực hiện truy vấn với bộ lọc vừa tạo
        const rooms = await Room.find(query).sort({ createdAt: 1 }); // Mới nhất lên đầu
        
        res.json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

roomRouter.get('/feature-room', async (req, res) => {
    try {
        // 1. Tìm các phòng có is_featured = true và chưa bị xóa
        const featuredRooms = await Room.find({ 
            is_featured: true,
            is_available: true,
            is_deleted: false 
        })
        // 2. Chỉ lấy các trường cần thiết để tối ưu performance
        .select('title hero base_price slug typeRoom')
        .limit(6); // (Tùy chọn) Giới hạn số lượng hiển thị, ví dụ 6 phòng

        res.json({ 
            success: true, 
            message: "Lấy danh sách phòng nổi bật thành công",
            data: featuredRooms 
        });

    } catch (error) {
        console.error("Lỗi lấy Feature Room:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

roomRouter.get('/availability/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm các Combo (Offer) có chứa phòng này
        const relatedOffers = await Offer.find({ "included_rooms.room_id": id }).select('_id');
        const offerIds = relatedOffers.map(o => o._id);

        // 2. Tìm hoá đơn: (Có room_id này) HOẶC (Có offer_id nằm trong danh sách trên)
        const invoices = await Invoice.find({
            status: { $ne: 'ĐÃ HUỶ' }, 
            $or: [
                { "booked_rooms.room_id": id },
                { "booked_rooms.offer_id": { $in: offerIds } }
            ]
        }).select('booked_rooms');

        let bookedDates = [];

        invoices.forEach(inv => {
            inv.booked_rooms.forEach(item => {
                // Kiểm tra nếu là đặt lẻ phòng này
                const isDirectMatch = item.room_id && item.room_id.toString() === id;
                // Kiểm tra nếu là đặt combo chứa phòng này
                const isComboMatch = item.offer_id && offerIds.some(oid => oid.toString() === item.offer_id.toString());

                if ((isDirectMatch || isComboMatch) && item.status !== 'HUỶ') {
                    bookedDates.push({
                        startDate: item.check_in,
                        endDate: item.check_out
                    });
                }
            });
        });

        res.json({ success: true, data: bookedDates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Lấy chi tiết 1 phòng theo Slug (Cho trang Detail)
roomRouter.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Tìm phòng theo slug và đảm bảo chưa bị xóa
        const room = await Room.findOne({ slug: slug, is_deleted: false });

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng này." });
        }

        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

roomRouter.post('/find-available', async (req, res) => {
    try {
        const { checkIn, checkOut, adults, children } = req.body;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn ngày nhận và trả phòng" });
        }

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        // 1. Tìm tất cả các phòng đã bị đặt trong khoảng thời gian này
        // Logic trùng lặp: (StartA < EndB) && (EndA > StartB)
        const conflictInvoices = await Invoice.find({
            status: { $ne: 'ĐÃ HUỶ' }, // Bỏ qua đơn đã huỷ
            "booked_rooms": {
                $elemMatch: {
                    check_in: { $lt: endDate },  // Ngày khách đến < Ngày người khác đi
                    check_out: { $gt: startDate }, // Ngày khách đi > Ngày người khác đến
                    status: { $ne: 'HUỶ' } // Phòng trong đơn đó không bị huỷ lẻ
                }
            }
        });

        // Lấy ra danh sách ID các phòng đang bận
        let busyRoomIds = [];
        conflictInvoices.forEach(inv => {
            inv.booked_rooms.forEach(room => {
                // Kiểm tra lại logic ngày cho từng phòng cụ thể trong đơn
                const rCheckIn = new Date(room.check_in);
                const rCheckOut = new Date(room.check_out);
                
                if (rCheckIn < endDate && rCheckOut > startDate && room.status !== 'HUỶ') {
                    if (room.room_id) busyRoomIds.push(room.room_id.toString());
                    
                    // Nếu là Combo (Offer), cần logic phức tạp hơn để tìm room gốc, 
                    // tạm thời ở đây ta giả định hệ thống check theo room_id trực tiếp.
                }
            });
        });

        // 2. Lấy danh sách phòng khả dụng (Không bị xóa, đang active, và không nằm trong danh sách bận)
        const availableRooms = await Room.find({
            is_deleted: false,
            is_available: true,
            _id: { $nin: busyRoomIds } // Loại bỏ phòng bận
        });

        if (availableRooms.length === 0) {
            return res.status(404).json({ success: false, message: "Hết phòng trong khoảng thời gian này." });
        }

        // 3. Lọc theo sức chứa (Số lượng khách)
        // Vì field 'occupancy' trong DB là mảng String (VD: ["2 Người lớn", "1 Trẻ em"]), ta cần parse nó.
        
        const reqAdults = parseInt(adults) || 1;
        const reqChildren = parseInt(children) || 0;
        const totalReqGuests = reqAdults + reqChildren;

        // Hàm tiện ích: Phân tích chuỗi "2 người lớn, 1 trẻ em..." trả về số
        const parseCapacity = (str) => {
            const lower = str.toLowerCase();
            let ad = 0;
            let ch = 0;
            
            // Regex lấy số đứng trước chữ "người lớn" hoặc "adult"
            const adMatch = lower.match(/(\d+)\s*(?:người lớn|nguoi lon|adult)/);
            if (adMatch) ad = parseInt(adMatch[1]);

            // Regex lấy số đứng trước chữ "trẻ em" hoặc "bé" (bất chấp phía sau có chữ "dưới 6 tuổi" hay không)
            const chMatch = lower.match(/(\d+)\s*(?:trẻ em|tre em|child|bé)/);
            if (chMatch) ch = parseInt(chMatch[1]);

            return { maxAdults: ad, maxChildren: ch };
        };

        const suitableRoom = availableRooms.find(room => {
            // Nếu data phòng lỗi không có occupancy thì bỏ qua
            if (!room.details || !room.details.occupancy || !Array.isArray(room.details.occupancy)) return false;

            // Kiểm tra: Chỉ cần MỘT trong các dòng cấu hình của phòng thỏa mãn yêu cầu là ĐƯỢC
            // Ví dụ: Occupancy = ["4 người lớn", "2 người lớn, 3 trẻ em"]
            // Khách đi: 2 lớn, 2 bé -> Cấu hình 1 (4 lớn) thoả mãn (lấy chỗ người lớn bù trẻ em), Cấu hình 2 cũng thoả mãn.
            
            return room.details.occupancy.some(optionStr => {
                const { maxAdults, maxChildren } = parseCapacity(optionStr);

                // --- LOGIC SO SÁNH ---
                
                // Trường hợp 1: Khớp cứng (Strict)
                // Phòng có đủ slot người lớn VÀ đủ slot trẻ em
                const isStrictMatch = (maxAdults >= reqAdults) && (maxChildren >= reqChildren);

                // Trường hợp 2: Linh hoạt (Flexible) - Dành cho cấu hình kiểu "4 người lớn"
                // Nếu phòng chỉ ghi người lớn, ta coi đó là tổng sức chứa.
                // (Giả sử slot người lớn có thể cho trẻ em nằm, nhưng slot trẻ em không thể cho người lớn nằm)
                const isFlexMatch = (maxAdults >= totalReqGuests);

                return isStrictMatch || isFlexMatch;
            });
        });

        if (suitableRoom) {
            return res.json({ 
                success: true, 
                message: "Tìm thấy phòng phù hợp", 
                data: suitableRoom 
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: `Rất tiếc, không còn phòng trống nào phù hợp cho ${reqAdults} người lớn và ${reqChildren} trẻ em trong ngày này.` 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default roomRouter;