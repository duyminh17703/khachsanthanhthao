import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Sử dụng 587 cho TLS (hoặc 465 cho SSL)
    secure: false, // false cho port 587, true cho port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  
    },
    tls: {
        rejectUnauthorized: false // Bỏ qua lỗi certificate nếu chạy ở localhost/môi trường dev
    }
});

export const sendBookingEmail = async (invoice) => {
    const { customer_info, booking_code, booked_rooms, booked_services, final_total, payment_method, status } = invoice;

    // Định dạng tiền tệ
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Tạo nội dung danh sách phòng/combo
    const roomsHtml = booked_rooms.map(room => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;"><b>${room.room_title}</b><br/><small>${room.is_combo ? 'Gói Combo' : 'Phòng nghỉ'}</small></td>
            <td style="padding: 10px;">${new Date(room.check_in).toLocaleDateString('vi-VN')} - ${new Date(room.check_out).toLocaleDateString('vi-VN')}</td>
            <td style="padding: 10px; text-align: right;">${formatCurrency(room.total_room_price)}</td>
        </tr>
    `).join('');

    // Tạo nội dung danh sách dịch vụ
    const servicesHtml = booked_services.length > 0 ? `
        <h4>Dịch vụ bổ sung:</h4>
        <table style="width: 100%; border-collapse: collapse;">
            ${booked_services.map(svc => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${svc.service_title}</td>
                    <td style="padding: 10px; text-align: right;">${formatCurrency(svc.total_service_price)}</td>
                </tr>
            `).join('')}
        </table>
    ` : '';

    const mailOptions = {
        from: `"Thanh Thảo Hotel" <${process.env.EMAIL_USER}>`,
        to: customer_info.email,
        subject: `[Xác nhận đặt phòng] Mã đơn hàng: ${booking_code}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; pb-10px;">XÁC NHẬN ĐẶT PHÒNG THÀNH CÔNG</h2>
                <p>Chào <b>${customer_info.full_name}</b>,</p>
                <p>Cảm ơn bạn đã lựa chọn khách sạn Thanh Thảo. Dưới đây là thông tin chi tiết về đơn hàng của bạn:</p>
                
                <div style="background: #f9f9f9; padding: 15px; margin-bottom: 20px;">
                    <p><b>Mã đặt phòng:</b> <span style="font-size: 18px; color: #d32f2f;">${booking_code}</span></p>
                    <p><b>Trạng thái:</b> ${status}</p>
                    <p><b>Phương thức thanh toán:</b> ${payment_method === 'CASH' ? 'Thanh toán tại quầy' : payment_method}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #eee;">
                            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                            <th style="padding: 10px; text-align: left;">Thời gian</th>
                            <th style="padding: 10px; text-align: right;">Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roomsHtml}
                    </tbody>
                </table>
                
                ${servicesHtml}

                <div style="text-align: right; margin-top: 20px;">
                    <h3>Tổng cộng: <span style="color: #d32f2f;">${formatCurrency(final_total)}</span></h3>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #666;">
                    * Lưu ý: Quý khách vui lòng xuất trình mã đặt phòng này khi làm thủ tục nhận phòng tại lễ tân.<br/>
                    Hotline hỗ trợ: 0942.819.936
                </p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

export const sendCancelEmail = async (invoice) => {
    const { customer_info, booking_code, final_total } = invoice;
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const mailOptions = {
        from: `"Thanh Thảo Hotel" <${process.env.EMAIL_USER}>`,
        to: customer_info.email,
        subject: `[Thông báo Hủy đơn] Mã đơn hàng: ${booking_code}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">THÔNG BÁO HỦY ĐẶT PHÒNG</h2>
                <p>Chào <b>${customer_info.full_name}</b>,</p>
                <p>Khách sạn Thanh Thảo xin thông báo đơn đặt phòng của bạn đã được <b>HỦY</b> trên hệ thống.</p>
                
                <div style="background: #fff5f5; border-left: 4px solid #d32f2f; padding: 15px; margin-bottom: 20px;">
                    <p><b>Mã đơn hàng:</b> <span style="font-size: 16px; font-weight: bold;">${booking_code}</span></p>
                    <p><b>Tổng giá trị đơn:</b> ${formatCurrency(final_total)}</p>
                    <p><b>Trạng thái:</b> <span style="color: #d32f2f; font-weight: bold;">ĐÃ HỦY</span></p>
                </div>

                <p>Nếu bạn đã thanh toán trực tuyến trước đó, bộ phận kế toán sẽ thực hiện hoàn tiền theo chính sách của khách sạn trong vòng 3-5 ngày làm việc.</p>
                
                <p>Nếu bạn không thực hiện yêu cầu này hoặc có thắc mắc, vui lòng liên hệ ngay với chúng tôi qua số Hotline bên dưới.</p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #666; text-align: center;">
                    <b>Khách sạn Thanh Thảo</b><br/>
                    Địa chỉ: [Địa chỉ của bạn]<br/>
                    Hotline hỗ trợ: 0942.819.936
                </p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};