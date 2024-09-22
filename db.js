import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

async function connectToDatabase() {
    const uri = process.env.MONGO_URL;
    try {
        return mongoose.connect(uri).then(() => {
            console.log('MongoDB bağlantısı başarılı');
        }).catch((err) => {
            console.error('MongoDB bağlantı hatası:', err);
        });
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err);
    }
}

export { connectToDatabase };
