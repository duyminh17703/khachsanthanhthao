import express from 'express';
import "dotenv/config";
import cors from 'cors';
import connectDB from './configs/db.js';
import roomRouter from './routes/RoomRoutes.js';
import cartRouter from './routes/CartRoutes.js';
import adminRouter from './routes/AdminRoutes.js';
import uploadRouter from './routes/UploadRoutes.js';
import invoiceRouter from './routes/InvoiceRoutes.js';
import Service from './routes/ServiceRoutes.js';
import OfferRoutes from './routes/OfferRoutes.js';

connectDB();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://khachsanthanhthao.top',
  'https://www.khachsanthanhthao.top'
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có origin (như Postman, App Mobile)
    if (!origin) return callback(null, true);
    
    // Kiểm tra: Nếu nằm trong danh sách HOẶC là domain con của vercel.app
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    const msg = 'Lỗi CORS: Origin này không được phép truy cập.';
    return callback(new Error(msg), false);
  },
  credentials: true 
}));

app.use(express.json());

app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/cart/", cartRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/full-service", Service);
app.use("/api/v1/offers", OfferRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!!!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
