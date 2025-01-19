import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB = process.env.MONGO_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(DB);
        console.log("DB connected");
    } catch (e) {
        console.error("ERROR:", e);
        throw e;
    }
    }
export default connectDB;