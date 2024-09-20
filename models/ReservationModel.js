
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    flightNumber: {
        type: String,
        required: true
    },
    departure: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    travelClass: {
        type: String,
        required: true,
        enum: ['Economy', 'Business', 'First']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Reservation = mongoose.model('Flight', reservationSchema);
export default Reservation;