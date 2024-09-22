import express from 'express';
const router = express.Router();
import { bookFlight, getAllFlights, getAverageFarePrice } from '../controllers/BookingController.js';

router.post('/book', bookFlight);
router.get("/all", getAllFlights);
router.get("/average", getAverageFarePrice);

export default router;