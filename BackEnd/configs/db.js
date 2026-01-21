import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("Đã kết nối MongoDB thành công!"));
        mongoose.connection.on("error", (err) => console.log("Lỗi rồi: ", err));

        if (!process.env.MONGODB_URL) {
            throw new Error("Chưa cấu hình biến MONGODB_URL trong file .env");
        }
        await mongoose.connect(process.env.MONGODB_URL);

    } catch (error) {
        console.error("Kết nối thất bại, tụt hết cả mood!", error.message);
        process.exit(1); 
    }
}

export default connectDB;