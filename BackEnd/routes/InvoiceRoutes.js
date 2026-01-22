import express from 'express';
import Invoice from '../models/Invoice.js';
import { verifyToken } from '../middleware/authMiddle.js';
import Room from '../models/Room.js';
import Service from '../models/Service.js';
import '../models/Offer.js';
import moment from 'moment';
import querystring from 'qs'; 
import crypto from 'crypto';  
import { sendBookingEmail, sendCancelEmail } from '../configs/mailUtils.js';

const invoiceRouter = express.Router();

// --- 1. API TẠO ĐƠN & THANH TOÁN ---
invoiceRouter.post('/create', async (req, res) => {
    try {
        const { customer_info, booked_rooms, booked_services, final_total, payment_method } = req.body;

        if (!customer_info || !customer_info.phone || !customer_info.full_name) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin khách hàng!" });
        }

        const uniqueSuffix = Date.now().toString().slice(-4) + Math.floor(Math.random() * 99);
        const generatedCode = `FS-${uniqueSuffix}`;

        let initialStatus = 'CHỜ XÁC NHẬN';
        if (payment_method === 'VNPAY' || payment_method === 'MOMO') {
            initialStatus = 'CHỜ THANH TOÁN ONLINE';
        }

        const newInvoice = new Invoice({
            booking_code: generatedCode,
            customer_info,
            booked_rooms,       
            booked_services: booked_services || [], 
            final_total,
            payment_method: payment_method || 'CASH',
            status: initialStatus
        });

        await newInvoice.save();

        // NẾU LÀ VNPAY -> TẠO URL THANH TOÁN
        if (payment_method === 'VNPAY') {
            const paymentUrl = createPaymentUrl(req, newInvoice);
            return res.status(201).json({ 
                success: true, 
                message: "Đang chuyển hướng thanh toán...", 
                bookingCode: generatedCode,
                paymentUrl: paymentUrl, 
                isRedirect: true
            });
        }
        if (payment_method === 'CASH') {
            // rồi mới bắt đầu quy trình gửi mail ngầm bên dưới.
            setTimeout(() => {
                console.log("--> Bắt đầu gửi email ngầm...");
                sendBookingEmail(newInvoice)
                    .then(() => console.log("--> Gửi email thành công!"))
                    .catch((err) => {
                        console.error("--> LỖI GỬI MAIL:", err.message);
                    });
            }, 100); // Chờ 100ms rồi mới chạy gửi mail
        }

        res.status(201).json({ success: true, message: "Đặt phòng thành công!", bookingCode: generatedCode });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 2. HÀM TẠO URL VNPAY (ĐÃ SỬA LỖI SIGNATURE) ---
function createPaymentUrl(req, invoice) {
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    
    if (ipAddr === '::1') {
        ipAddr = '127.0.0.1'; 
    }

    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;
    let orderId = invoice.booking_code;
    let amount = invoice.final_total;
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId; // Rút gọn nội dung cho an toàn
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sắp xếp tham số
    vnp_Params = sortObject(vnp_Params);

    let signData = ""; 
    let i = 0;
    for (let key in vnp_Params) {
        if (i === 1) { signData += "&"; }
        signData += key + "=" + vnp_Params[key];
        i = 1;
    }

    let hmac = crypto.createHmac("sha512", secretKey);
    // [FIX 2] Dùng Buffer.from thay vì new Buffer
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    // [FIX 3 - QUAN TRỌNG NHẤT]
    // Không dùng qs.stringify nữa. Nối trực tiếp signData vào để đảm bảo đồng nhất.
    vnpUrl += '?' + signData + '&vnp_SecureHash=' + signed;

    return vnpUrl;
}

// Hàm sortObject (Giữ nguyên logic chuẩn của VNPay)
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
    return sorted;
}

// --- 3. API RETURN URL ---
// TRONG InvoiceRoutes.js
invoiceRouter.get('/vnpay_return', async (req, res) => {
    const FRONTEND_URL = "http://khachsanthanhthao.top"; // Đảm bảo khớp với port React của bạn
    
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        const bookingCode = vnp_Params['vnp_TxnRef']; // Lấy mã đơn hàng để dùng cho redirect kể cả khi lỗi

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let secretKey = process.env.VNP_HASH_SECRET;
        let signData = ""; 
        let i = 0;
        for (let key in vnp_Params) {
            if (i === 1) { signData += "&"; }
            signData += key + "=" + vnp_Params[key];
            i = 1;
        }

        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        // KIỂM TRA CHỮ KÝ
        if(secureHash === signed){
            const rspCode = vnp_Params['vnp_ResponseCode'];

            if(rspCode === '00') {
                // THÀNH CÔNG: Cập nhật DB và gửi mail
                const updatedInvoice = await Invoice.findOneAndUpdate(
                    { booking_code: bookingCode },
                    { 
                        status: 'ĐÃ THANH TOÁN-CHỜ CHECKIN', 
                        is_paid: true,
                        transaction_ref: vnp_Params['vnp_TransactionNo']
                    },
                    { new: true }
                );

                if (updatedInvoice) {
                    try { await sendBookingEmail(updatedInvoice); } catch (e) {}
                }
                return res.redirect(`${FRONTEND_URL}/checkout-success?code=${bookingCode}&status=success`);
            } else {
                // KHÁCH HỦY (ResponseCode thường là 24) HOẶC LỖI THẺ
                console.log(`Thanh toán không thành công, mã lỗi: ${rspCode}`);
                return res.redirect(`${FRONTEND_URL}/checkout-fail?code=${bookingCode}&error=cancel`);
            }
        } else {
            // SAI CHỮ KÝ
            console.error("Checksum failed!");
            return res.redirect(`${FRONTEND_URL}/checkout-fail?code=${bookingCode}&error=checksum`);
        }
    } catch (error) {
        // TRƯỜNG HỢP CRASH CODE: Luôn đẩy về trang thất bại ở Frontend thay vì hiện lỗi ở Backend
        console.error("Lỗi xử lý vnpay_return:", error);
        res.redirect(`http://localhost:5173/checkout-fail?error=system`);
    }
});

invoiceRouter.get('/admin/all',verifyToken, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== 'ALL') query.status = status;
        if (search) {
            query.$or = [
                { booking_code: { $regex: search, $options: 'i' } },
                { "customer_info.phone": { $regex: search, $options: 'i' } },
                { "customer_info.full_name": { $regex: search, $options: 'i' } },
                { "customer_info.email": { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Invoice.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.get('/detail/:code', async (req, res) => {
    try {
        const booking = await Invoice.findOne({ booking_code: req.params.code })
            .populate('booked_rooms.room_id')   // Lấy info phòng
            .populate('booked_rooms.offer_id')  // [MỚI] Lấy info combo
            .populate('booked_services.service_id');

        if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


invoiceRouter.put('/admin/update-status', verifyToken, async (req, res) => {
    try {
        const { id, status } = req.body;
        
        // Tạo object cập nhật
        let updateData = { status };

        if (status === 'ĐÃ HOÀN THÀNH') {
            updateData.is_paid = true;
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id, 
            updateData, // Cập nhật cả status và is_paid nếu cần
            { new: true }
        );
        
        if (!updatedInvoice) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });

        if (status === 'ĐÃ HUỶ') {
            try {
                await sendCancelEmail(updatedInvoice);
            } catch (mailError) {
                console.error("Lỗi gửi mail hủy đơn:", mailError);
            }
        }
        res.json({ success: true, message: "Cập nhật thành công!", data: updatedInvoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


invoiceRouter.put('/admin/update-room-status', verifyToken, async (req, res) => {
    try {
        const { invoiceId, roomId, roomStatus } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });

        // Tìm và update status phòng
        const roomIndex = invoice.booked_rooms.findIndex(r => r._id.toString() === roomId);
        if (roomIndex === -1) return res.status(404).json({ success: false, message: "Không tìm thấy phòng." });

        invoice.booked_rooms[roomIndex].status = roomStatus;

        // --- LOGIC TỰ ĐỘNG ---
        // Kiểm tra tất cả phòng đã được xử lý chưa (Đã Checkin hoặc Đã Huỷ)
        const allProcessed = invoice.booked_rooms.every(room => 
            room.status === 'ĐÃ CHECKIN' || room.status === 'HUỶ'
        );

        const hasActiveRoom = invoice.booked_rooms.some(room => room.status === 'ĐÃ CHECKIN');

        if (allProcessed) {
            if (hasActiveRoom) {
                // [SỬA] Khi tất cả phòng đã checkin -> Trạng thái đơn là ĐÃ CHECKIN (Đang ở)
                invoice.status = 'ĐÃ CHECKIN'; 
            } else {
                invoice.status = 'ĐÃ HUỶ';
                try {
                    await sendCancelEmail(invoice);
                } catch (mailError) {
                    console.error("Lỗi gửi mail hủy tự động:", mailError);
                }
            }
        } else {
            // Chưa xong (vẫn còn phòng CHỜ CHECKIN) => Giữ nguyên trạng thái chờ checkin
            // Chỉ update lại nếu nó chưa phải là trạng thái này (để tránh ghi đè nếu đang ở trạng thái khác)
            if (invoice.status !== 'ĐÃ XÁC NHẬN-CHỜ CHECKIN') {
                 // Logic tuỳ chỉnh: nếu bạn muốn quay ngược lại trạng thái này khi lỡ tay
                 invoice.status = 'ĐÃ XÁC NHẬN-CHỜ CHECKIN';
            }
        }

        await invoice.save();

        res.json({ 
            success: true, 
            message: "Cập nhật phòng thành công!", 
            data: invoice 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.put('/admin/update-customer', verifyToken, async (req, res) => {
    try {
        const { id, customer_info } = req.body;
        
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            { customer_info: customer_info },
            { new: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hoá đơn." });
        }

        res.json({ success: true, message: "Cập nhật thông tin khách hàng thành công!", data: updatedInvoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.get('/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        let cleanCode = code.trim().toUpperCase();
        if (!cleanCode.startsWith('FS-')) {
            cleanCode = `FS-${cleanCode}`;
        }

        const invoice = await Invoice.findOne({ booking_code: cleanCode });

        if (!invoice) {
            return res.status(404).json({ success: false});
        }

        // --- [LOGIC MỚI] CHẶN CÁC TRẠNG THÁI KHÔNG ĐƯỢC PHÉP THÊM DỊCH VỤ ---
        const blockedStatuses = ['CHỜ XÁC NHẬN', 'CHỜ THANH TOÁN ONLINE', 'ĐÃ HUỶ'];
        
        if (blockedStatuses.includes(invoice.status)) {
            let msg = "Đơn hàng đã bị huỷ.";
            if (invoice.status === 'CHỜ THANH TOÁN ONLINE') msg = "Đơn hàng đang chờ thanh toán.";
            if (invoice.status === 'CHỜ XÁC NHẬN') msg = "Đơn hàng đang chờ xác nhận.";
            
            return res.status(400).json({ success: false, message: msg });
        }
        // ---------------------------------------------------------------------

        if (!invoice.booked_rooms || invoice.booked_rooms.length === 0) {
            return res.status(400).json({ success: false, message: "Đơn hàng này không có phòng nào." });
        }

        const checkIns = invoice.booked_rooms.map(r => new Date(r.check_in).getTime()).filter(t => !isNaN(t));
        const checkOuts = invoice.booked_rooms.map(r => new Date(r.check_out).getTime()).filter(t => !isNaN(t));

        if (checkIns.length === 0 || checkOuts.length === 0) {
            return res.status(400).json({ success: false, message: "Dữ liệu ngày đặt phòng bị lỗi." });
        }

        const minDate = new Date(Math.min(...checkIns));
        const maxDate = new Date(Math.max(...checkOuts));

        res.json({ 
            success: true, 
            message: "Mã hợp lệ", 
            data: {
                validStartDate: minDate,
                validEndDate: maxDate,
                customerName: invoice.customer_info.full_name,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.post('/add-services', async (req, res) => {
    try {
        const { booking_code, new_services, additional_total } = req.body;
        const invoice = await Invoice.findOne({ booking_code: booking_code });

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng gốc" });
        }

        // --- [LOGIC MỚI] ---
        const blockedStatuses = ['CHỜ XÁC NHẬN', 'CHỜ THANH TOÁN ONLINE', 'ĐÃ HUỶ'];
        if (blockedStatuses.includes(invoice.status)) {
            return res.status(400).json({ success: false, message: `Không thể thêm dịch vụ vào đơn hàng đang ở trạng thái: ${invoice.status}` });
        }
        // -------------------

        invoice.booked_services = [...invoice.booked_services, ...new_services];
        invoice.final_total += additional_total;
        
        // Lưu vào database (bước này nhanh, để await được)
        await invoice.save();

        // 1. GỬI PHẢN HỒI NGAY LẬP TỨC (Không chờ mail)
        res.json({
            success: true,
            message: "Đã thêm dịch vụ thành công",
            bookingCode: booking_code,
            data: invoice
        });

        // 2. GỬI MAIL NGẦM (Dùng setTimeout để tách luồng)
        setTimeout(() => {
            console.log(`--> [Add Service] Bắt đầu gửi email cập nhật cho đơn ${booking_code}...`);
            sendBookingEmail(invoice)
                .then(() => console.log(`--> [Add Service] Gửi email thành công!`))
                .catch((mailError) => {
                    // Log lỗi chi tiết để bạn biết tại sao mail không đi (sai pass, chặn port...)
                    console.error("--> [Add Service] LỖI GỬI MAIL:", mailError.message);
                });
        }, 100);

    } catch (error) {
        console.error("Lỗi thêm dịch vụ:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.put('/admin/update-room-dates', verifyToken, async (req, res) => {
    try {
        const { invoiceId, roomId, checkIn, checkOut } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });

        const roomIndex = invoice.booked_rooms.findIndex(r => r._id.toString() === roomId);
        if (roomIndex === -1) return res.status(404).json({ success: false, message: "Không tìm thấy phòng." });

        // 1. Tính toán ngày đêm mới
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        
        if (d2 <= d1) return res.status(400).json({ success: false, message: "Ngày check-out phải sau ngày check-in" });

        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        // Lưu ý: Nếu khách ở vài tiếng vẫn tính 1 đêm hoặc tuỳ logic khách sạn, ở đây tôi dùng hàm ceil

        // 2. Cập nhật thông tin phòng
        const room = invoice.booked_rooms[roomIndex];
        room.check_in = d1;
        room.check_out = d2;
        room.total_nights = diffDays;
        room.total_room_price = diffDays * room.price_per_night; // Tính lại tiền phòng

        // 3. Tính lại TỔNG TIỀN ĐƠN HÀNG (QUAN TRỌNG)
        // Tổng = Tổng các phòng + Tổng dịch vụ
        const totalRooms = invoice.booked_rooms.reduce((sum, r) => sum + r.total_room_price, 0);
        const totalServices = invoice.booked_services.reduce((sum, s) => sum + s.total_service_price, 0);
        
        invoice.final_total = totalRooms + totalServices;

        await invoice.save();
        res.json({ success: true, message: "Cập nhật ngày & giá thành công!", data: invoice });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.delete('/admin/remove-service', verifyToken, async (req, res) => {
    try {
        const { invoiceId, serviceItemId } = req.body; // Lưu ý: DELETE thường gửi data qua query hoặc body tuỳ config, dùng body cho tiện

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });

        // 1. Lọc bỏ dịch vụ
        invoice.booked_services = invoice.booked_services.filter(s => s._id.toString() !== serviceItemId);

        // 2. Tính lại tổng đơn
        const totalRooms = invoice.booked_rooms.reduce((sum, r) => sum + r.total_room_price, 0);
        const totalServices = invoice.booked_services.reduce((sum, s) => sum + s.total_service_price, 0);
        invoice.final_total = totalRooms + totalServices;

        await invoice.save();
        res.json({ success: true, message: "Đã xoá dịch vụ!", data: invoice });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.put('/admin/update-service-dates', verifyToken, async (req, res) => {
    try {
        const { invoiceId, serviceItemId, newDates } = req.body; // newDates là mảng ["2024-01-01", "2024-01-02"...]

        if (!newDates || !Array.isArray(newDates) || newDates.length === 0) {
            return res.status(400).json({ message: "Vui lòng chọn ít nhất 1 ngày" });
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: "Không tìm thấy đơn." });

        const svcIndex = invoice.booked_services.findIndex(s => s._id.toString() === serviceItemId);
        if (svcIndex === -1) return res.status(404).json({ success: false, message: "Dịch vụ không tồn tại." });

        // 1. Cập nhật mảng ngày & số lượng
        const svc = invoice.booked_services[svcIndex];
        
        svc.service_dates = newDates; // Lưu danh sách ngày mới
        svc.quantity = newDates.length; // Số lượng = Số ngày
        svc.total_service_price = svc.unit_price * svc.quantity; // Tính lại giá

        // 2. Tính lại tổng đơn hàng
        const totalRooms = invoice.booked_rooms.reduce((sum, r) => sum + r.total_room_price, 0);
        const totalServices = invoice.booked_services.reduce((sum, s) => sum + s.total_service_price, 0);
        invoice.final_total = totalRooms + totalServices;

        await invoice.save();
        res.json({ success: true, message: "Đã cập nhật lịch dịch vụ!", data: invoice });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.get('/search/:code', async (req, res) => {
    try {
        const { code } = req.params;
        let searchCode = code.trim().toUpperCase(); 
        if (!searchCode.startsWith('FS-')) {
            searchCode = `FS-${searchCode}`;
        }

        const invoice = await Invoice.findOne({ 
            booking_code: searchCode 
        })
        .populate('booked_rooms.room_id')
        .populate('booked_rooms.offer_id') // [MỚI] Populate thêm Offer
        .populate('booked_services.service_id'); 

        if (!invoice) {
            return res.status(404).json({ 
                success: false, 
                message: `Không tìm thấy đơn hàng có mã: ${searchCode}` 
            });
        }
        
        res.json({ success: true, data: invoice });

    } catch (error) {
        console.error("[SEARCH ERROR]", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
});

// --- API TẠO LẠI URL THANH TOÁN (CHO KHÁCH BỊ MẤT LINK) ---
invoiceRouter.post('/create_payment_url', async (req, res) => {
    try {
        const { booking_code } = req.body;
        
        const invoice = await Invoice.findOne({ booking_code: booking_code });
        
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        }

        // Chỉ cho phép thanh toán lại nếu trạng thái là CHỜ THANH TOÁN ONLINE
        if (invoice.status !== 'CHỜ THANH TOÁN ONLINE') {
            return res.status(400).json({ success: false, message: "Đơn hàng này không ở trạng thái chờ thanh toán online." });
        }

        // Tái sử dụng hàm createPaymentUrl bạn đã viết (Hàm đã fix lỗi chữ ký)
        const paymentUrl = createPaymentUrl(req, invoice);

        res.json({ 
            success: true, 
            paymentUrl: paymentUrl 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

invoiceRouter.get('/admin/dashboard-stats', verifyToken, async (req, res) => {
    try {
        const { range } = req.query; // Nhận tham số: 'week', 'month', 'quarter'

        // ====================================================
        // 1. XỬ LÝ KHOẢNG THỜI GIAN (LOGIC MỚI)
        // ====================================================
        let daysToSubtract = 7;
        let dataPoints = 7; // Số điểm dữ liệu trên biểu đồ
        
        if (range === 'month') {
            daysToSubtract = 30;
            dataPoints = 30;
        } else if (range === 'quarter') {
            daysToSubtract = 90;
            dataPoints = 90;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToSubtract);
        startDate.setHours(0, 0, 0, 0); // Reset về đầu ngày

        // ====================================================
        // 2. TÍNH TOÁN DOANH THU & COUNTS (CHUNG)
        // ====================================================
        // Tổng doanh thu toàn thời gian
        const revenueData = await Invoice.aggregate([
            { $match: { status: 'ĐÃ HOÀN THÀNH' } },
            { $group: { _id: null, total: { $sum: "$final_total" } } }
        ]);

        const pendingCount = await Invoice.countDocuments({ status: 'CHỜ XÁC NHẬN' });
        const stayingCount = await Invoice.countDocuments({ status: { $in: ['ĐÃ CHECKIN', 'ĐÃ XÁC NHẬN-CHỜ CHECKIN', 'ĐÃ THANH TOÁN-CHỜ CHECKIN'] } });

        // ====================================================
        // 3. DỮ LIỆU BIỂU ĐỒ (THEO RANGE)
        // ====================================================
        const chartStats = await Invoice.aggregate([
            { 
                $match: { 
                    status: 'ĐÃ HOÀN THÀNH',
                    createdAt: { $gte: startDate } // Lọc theo ngày bắt đầu động
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyTotal: { $sum: "$final_total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Tạo mảng dữ liệu đầy đủ (lấp đầy các ngày không có doanh thu)
        let finalChartData = [];
        for (let i = dataPoints - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Logic hiển thị tên trục X:
            // - Nếu là tuần: Hiển thị "Thứ 2", "Thứ 3"...
            // - Nếu là tháng/quý: Hiển thị ngày/tháng (VD: 15/01) cho đỡ rối
            let dayName;
            if (range === 'month' || range === 'quarter') {
                dayName = `${d.getDate()}/${d.getMonth() + 1}`; // Format DD/MM
            } else {
                dayName = `Thứ ${d.getDay() + 1 === 1 ? 'CN' : d.getDay() + 1}`;
            }

            const found = chartStats.find(item => item._id === dateStr);
            
            finalChartData.push({
                name: dayName,
                date: dateStr,
                revenue: found ? found.dailyTotal : 0
            });
        }

        // ====================================================
        // 4. PHÂN TÍCH DỊCH VỤ & PHÒNG (GIỮ NGUYÊN CODE CŨ)
        // ====================================================
        // Top dịch vụ
        const serviceStats = await Invoice.aggregate([
            // 1. Lọc đơn hợp lệ
            { $match: { status: { $in: ['ĐÃ HOÀN THÀNH', 'ĐÃ CHECKIN', 'ĐÃ XÁC NHẬN-CHỜ CHECKIN', 'ĐÃ THANH TOÁN-CHỜ CHECKIN'] } } },

            // 2. Tách mảng dịch vụ
            { $unwind: "$booked_services" },

            // 3. Gom nhóm
            { 
                $group: { 
                    _id: "$booked_services.service_id", 
                    
                    // [FIX 1 - QUAN TRỌNG]: Tính số lượng dựa trên số ngày (service_dates)
                    // Vì Schema không có trường 'quantity', ta đếm độ dài mảng service_dates.
                    // Nếu mảng rỗng (dịch vụ 1 lần), mặc định tính là 1.
                    count: { 
                        $sum: { 
                            $cond: { 
                                if: { $gt: [{ $size: { $ifNull: ["$booked_services.service_dates", []] } }, 0] }, 
                                then: { $size: "$booked_services.service_dates" }, 
                                else: 1 
                            } 
                        } 
                    },

                    revenue: { $sum: "$booked_services.total_service_price" },
                    
                    // [FIX 2]: Lấy luôn tên & ảnh trong Invoice làm dự phòng (Backup)
                    snapshot_title: { $first: "$booked_services.service_title" },
                    snapshot_image: { $first: "$booked_services.service_thumbnail" }
                } 
            },

            // 4. Sắp xếp doanh thu cao nhất
            { $sort: { revenue: -1 } },
            { $limit: 5 },

            // 5. Lookup sang bảng Services (Lấy thông tin mới nhất)
            { 
                $lookup: { 
                    from: "services", 
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "service_info" 
                } 
            },

            // 6. Tách mảng info
            { $unwind: { path: "$service_info", preserveNullAndEmptyArrays: true } },

            // 7. Định dạng kết quả cuối cùng
            { 
                $project: { 
                    // Ưu tiên lấy Tên mới nhất -> Nếu không có thì lấy Tên trong hoá đơn -> Default
                    title: { 
                        $ifNull: ["$service_info.title", { $ifNull: ["$snapshot_title", "Dịch vụ đã xoá"] }] 
                    },
                    // Ưu tiên lấy Ảnh mới nhất -> Ảnh trong hoá đơn -> Null
                    image: { 
                        $ifNull: [{ $arrayElemAt: ["$service_info.gallery", 0] }, "$snapshot_image"] 
                    },
                    count: 1, 
                    revenue: 1 
                } 
            }
        ]);

        // Thống kê phòng
        const activeInvoices = await Invoice.find({ status: { $in: ['ĐÃ CHECKIN', 'ĐÃ XÁC NHẬN-CHỜ CHECKIN', 'ĐÃ THANH TOÁN-CHỜ CHECKIN'] } }).select('booked_rooms');
        let occupiedRoomIds = [];
        activeInvoices.forEach(inv => inv.booked_rooms.forEach(r => { if (r.room_id) occupiedRoomIds.push(r.room_id.toString()); }));
        
        const allRooms = await Room.find({ is_deleted: false }).select('_id typeRoom title');
        const roomTypeMap = {};
        allRooms.forEach(room => {
            const type = room.typeRoom || 'Khác';
            if (!roomTypeMap[type]) roomTypeMap[type] = { name: type, total: 0, occupied: 0 };
            roomTypeMap[type].total += 1;
            if (occupiedRoomIds.includes(room._id.toString())) roomTypeMap[type].occupied += 1;
        });
        const roomTypeStats = Object.values(roomTypeMap);
        
        const totalRooms = allRooms.length;
        const totalOccupied = occupiedRoomIds.length;
        const occupancyRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

        // ====================================================
        // 5. TRẢ VỀ KẾT QUẢ
        // ====================================================
        const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            success: true,
            stats: {
                totalRevenue: revenueData[0]?.total || 0,
                pendingBookings: pendingCount,
                stayingGuests: stayingCount,
                occupancyRate: occupancyRate
            },
            chartData: finalChartData, // Dữ liệu đã xử lý theo range
            serviceStats,
            roomTypeStats,
            recentInvoices
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default invoiceRouter;