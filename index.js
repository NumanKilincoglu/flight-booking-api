import express from "express";

import bodyParser from "body-parser";
import FlightRoutes from './routes/FlightRoutes.js';
import ReservationRoutes from './routes/BookingRoutes.js';
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv';
import { connectToDatabase } from "./db.js";

dotenv.config();
const app = express();
const port = 3003;

app.use(cors({
    origin: ['http://localhost:3000', 'https://flight-booking-app-wa3s.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/booking', ReservationRoutes);
app.use('/api/flights', FlightRoutes);

app.listen(port, () => {
    connectToDatabase();
    console.log(`Listening on port ${port}`)
})