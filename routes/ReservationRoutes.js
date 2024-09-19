import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (err) {
        res.status(400).json({ error: 'Rezervasyon kaydedilemedi', details: err });
    }
});

export default router;