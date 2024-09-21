import express from 'express';
const router = express.Router();
import Reservation from '../models/ReservationModel.js';
import mongoose from "mongoose";

router.post('/book', async (req, res) => {
    try {
        if (!req.body) return res.status(400).send({ success: false, error: 'Body is empty.' });
        const newReservation = new Reservation(req.body);
        const savedReservation = await newReservation.save();
        res.status(201).send({ success: true, result: savedReservation });
    } catch (err) {
        console.log(err.errorResponse.errmsg)
        res.status(400).send({ success: false, error: 'Already booked this. flight', id: req.body.id });
    }
});

router.get("/all", async (req, res) => {

    try {

        const { sortBy = 'scheduleDate', page = 1, limit = 10, order = 'DESC' } = req.query;
        const sortObject = {};
        sortObject[sortBy] = order.toLowerCase();

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const flights = await Reservation
            .find({})
            .sort(sortObject)
            .skip(skip)
            .limit(limitNum)

        const totalReservations = await Reservation.countDocuments();

        res.status(200).json({
            success: true,
            flights,
            totalPages: Math.ceil(totalReservations / limitNum),
            currentPage: pageNum,
        });
        
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            error: "Flight not found.",
            details: err?.message || err
        });
    }
});

router.get("/average", async (req, res) => {

    try {

        const flights = await Reservation.aggregate([
            {
                $group: {
                    _id: null,
                    averageFarePrice: { $avg: "$farePrice" }
                }
            }
        ]);

        const averageFarePrice = flights?.length > 0 ? flights[0].averageFarePrice : 0;

        res.status(200).json({
            success: true,
            averageFarePrice: averageFarePrice.toFixed(1)
        });

    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            error: "Flight not found.",
            averageFarePrice: 0
        });
    }
});

export default router;