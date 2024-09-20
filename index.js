import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import FlightRoutes from './routes/FlightRoutes.js';
import ReservationRoutes from './routes/ReservationRoutes.js';
import cors from 'cors';
import morgan from "morgan";
const app = express();
const port = 3003;

const uri = 'mongodb+srv://flight-booking-app:xzPDbHST8lLIflp2@flight-booking-app.poqkk.mongodb.net/?retryWrites=true&w=majority&appName=flight-booking-app'

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(morgan('dev'));


app.use('/api/reservations', ReservationRoutes);
app.use('/api/flights', FlightRoutes);

app.use(express.json());
app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})