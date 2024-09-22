import mongoose, { Schema } from "mongoose";

const ReservationSchema = new Schema({
    lastUpdatedAt: { type: String },
    actualLandingTime: { type: String },
    actualOffBlockTime: { type: String },
    aircraftRegistration: { type: String },
    aircraftType: {
        iataMain: { type: String },
        iataSub: { type: String }
    },
    baggageClaim: {
        belts: [{ type: String }]
    },
    codeshares: {
        codeshares: [{ type: String }]
    },
    estimatedLandingTime: { type: String },
    expectedTimeBoarding: { type: String },
    expectedTimeGateClosing: { type: String },
    expectedTimeGateOpen: { type: String },
    expectedTimeOnBelt: { type: String },
    expectedSecurityFilter: { type: String },
    flightDirection: { type: String },
    flightName: { type: String },
    flightNumber: { type: Number },
    gate: { type: String },
    pier: { type: String },
    id: { type: String, unique: true },
    farePrice: { type: Number, required: true },
    farePackage: { type: Array },
    tripType: { type: String },
    departureCode: { type: String },
    isOperationalFlight: { type: Boolean },
    mainFlight: { type: String },
    prefixIATA: { type: String },
    prefixICAO: { type: String },
    airlineCode: { type: Number },
    destinationCity: { type: String },
    departureCity: { type: String },
    publicEstimatedOffBlockTime: { type: String },
    publicFlightState: {
        flightStates: [{ type: String }]
    },
    route: {
        destinations: [{ type: String }],
        eu: { type: String },
        visa: { type: Boolean }
    },
    scheduleDateTime: { type: String },
    scheduleDate: { type: String },
    scheduleTime: { type: String },
    serviceType: { type: String },
    terminal: { type: Number },
    transferPositions: {
        transferPositions: [{ type: Number }]
    },
    schemaVersion: { type: String }
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

export default Reservation;