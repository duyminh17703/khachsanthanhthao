import express from 'express';
import Offer from '../models/Offer.js';
import Room from '../models/Room.js'; 
import Service from '../models/Service.js'; 
import Invoice from '../models/Invoice.js';

import { verifyToken } from '../middleware/authMiddle.js';

const offerRouter = express.Router();

// =========================================================
// 1. LẤY DANH SÁCH (Đã fix populate + bộ lọc public)
// =========================================================
offerRouter.get('/list', async (req, res) => {
    try {
        // Lấy tham số từ URL (VD: ?is_public=true)
        const { is_public } = req.query;

        let query = {};
        // Nếu client yêu cầu chỉ lấy public, thì thêm điều kiện lọc
        if (is_public === 'true') {
            query = { is_available: true };
        }

        const offers = await Offer.find(query)
            .populate('included_rooms.room_id', 'title base_price hero') // Cần import Room mới chạy đc dòng này
            .populate('included_services.service_id', 'title pricing_options gallery') // Cần import Service mới chạy đc dòng này
            .sort({ createdAt: -1 });
            
        res.json({ success: true, data: offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

offerRouter.get('/featured', async (req, res) => {
    try {
        // Chỉ lấy title, thumbnail và slug để tối ưu tốc độ
        const featuredOffers = await Offer.find({ 
            is_featured: true, 
            is_available: true 
        })
        .select('title thumbnail slug') 
        .limit(4); // Giới hạn 4 cái cho đẹp giao diện

        res.json({ success: true, data: featuredOffers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 2. LẤY CHI TIẾT THEO SLUG
// =========================================================
offerRouter.get('/slug/:slug', async (req, res) => {
    try {
        const offer = await Offer.findOne({ slug: req.params.slug })
            .populate('included_rooms.room_id')
            .populate('included_services.service_id');
            
        if (!offer) return res.status(404).json({ success: false, message: "Không tìm thấy ưu đãi" });
        res.json({ success: true, data: offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 3. LẤY CHI TIẾT THEO ID (Cho Admin Edit)
// =========================================================
offerRouter.get('/:id', async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id)
            .populate('included_rooms.room_id')
            .populate('included_services.service_id');
            
        if (!offer) return res.status(404).json({ success: false, message: "Không tìm thấy ưu đãi" });
        res.json({ success: true, data: offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 4. THÊM MỚI (Admin)
// =========================================================
offerRouter.post('/add', verifyToken, async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        await newOffer.save();
        res.status(201).json({ success: true, message: "Tạo ưu đãi thành công!", data: newOffer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 5. CẬP NHẬT (Admin)
// =========================================================
offerRouter.put('/update', verifyToken, async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        const updatedOffer = await Offer.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedOffer) return res.status(404).json({ success: false, message: "Không tìm thấy ưu đãi" });
        res.json({ success: true, message: "Cập nhật thành công!", data: updatedOffer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 6. XÓA (Admin)
// =========================================================
offerRouter.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) return res.status(404).json({ success: false, message: "Không tìm thấy ưu đãi" });
        res.json({ success: true, message: "Đã xóa ưu đãi thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

offerRouter.get('/availability/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm thông tin Combo này để biết nó gồm những phòng nào
        const targetOffer = await Offer.findById(id);
        if (!targetOffer) return res.status(404).json({ success: false, message: "Không tìm thấy Combo" });

        const roomIdsInCombo = targetOffer.included_rooms.map(r => r.room_id.toString());

        // 2. Tìm tất cả các Combo khác (kể cả chính nó) có chứa ít nhất 1 trong các phòng này
        const relatedOffers = await Offer.find({ 
            "included_rooms.room_id": { $in: roomIdsInCombo } 
        }).select('_id');
        const relatedOfferIds = relatedOffers.map(o => o._id);

        // 3. Quét Hoá đơn chưa huỷ có chứa:
        // - Đặt lẻ các phòng thuộc combo này
        // - Hoặc đặt các Combo khác mà dùng chung phòng với combo này
        const invoices = await Invoice.find({
            status: { $ne: 'ĐÃ HUỶ' },
            $or: [
                { "booked_rooms.room_id": { $in: roomIdsInCombo } },
                { "booked_rooms.offer_id": { $in: relatedOfferIds } }
            ]
        }).select('booked_rooms');

        let bookedDates = [];

        invoices.forEach(inv => {
            inv.booked_rooms.forEach(item => {
                let isMatch = false;
                // Khách đặt lẻ phòng có trong combo
                if (item.room_id && roomIdsInCombo.includes(item.room_id.toString())) isMatch = true;
                // Khách đặt combo khác có chứa phòng trong combo này
                if (item.offer_id && relatedOfferIds.some(rid => rid.toString() === item.offer_id.toString())) isMatch = true;

                if (isMatch && item.status !== 'HUỶ') {
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
export default offerRouter;