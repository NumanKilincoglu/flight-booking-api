import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URL;

async function connectToDatabase() {
    try {
        return mongoose.connect(uri, {
            useUnifiedTopology: true
        }).then(() => {
            console.log('MongoDB bağlantısı başarılı');
        }).catch((err) => {
            console.error('MongoDB bağlantı hatası:', err);
        });
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err);
    }
}

export { connectToDatabase };
