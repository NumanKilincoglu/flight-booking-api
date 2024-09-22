import fs from 'fs';
import axios from 'axios'
import dotenv from 'dotenv';
import { sleep } from '../utils/util.js';
dotenv.config();

export const getDestinations = async (req, res) => {
    try {

        const search = req.query.search?.toLowerCase();

        if (!search) {
            return res.status(400).json({ success: false, error: 'Search query is required.' });
        }

        if (!fs.existsSync('all_destinations.json')) {
            return res.status(404).json({ success: false, error: 'Destination data not found.' });
        }

        const fileData = fs.readFileSync('all_destinations.json', 'utf-8');
        const parsed = JSON.parse(fileData);

        const filteredDestinations = parsed.filter(destination => {
            const city = destination?.city?.toLowerCase() || '';
            const country = destination?.country?.toLowerCase() || '';

            return city.includes(search) || country.includes(search);
        });

        return res.status(200).json({
            success: true,
            destinations: filteredDestinations.slice(0, 10)
        });

    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false, error: "Flight not found.", details: err });
    }
}

export const getAirlines = async (req, res) => {

    try {

        const { page = 1, limit = 10 } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        if (!fs.existsSync('airlines.json')) {
            return res.status(404).send({ success: false, error: "Airlines file not found." });
        }

        const fileData = fs.readFileSync('airlines.json', 'utf-8');
        const parsed = JSON.parse(fileData);

        const validAirlines = parsed.filter(airline => airline.iata && airline.publicName);
        const sortedAirlines = validAirlines.sort((a, b) => a.publicName.localeCompare(b.publicName));

        const startIndex = (parsedPage - 1) * parsedLimit;
        const paginatedAirlines = sortedAirlines.slice(startIndex, startIndex + parsedLimit);

        if (paginatedAirlines.length === 0) {
            return res.status(200).send({
                success: true,
                airlines: [],
                message: "No airlines found for the current page."
            });
        }

        return res.status(200).send({
            success: true,
            airlines: paginatedAirlines,
            currentPage: parsedPage,
            totalPages: Math.ceil(validAirlines.length / parsedLimit),
            totalAirlines: validAirlines.length
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, error: "Error fetching airlines.", details: err });
    }
}

export const getAllFlights = async (req, res) => {
    try {

        const { from, to, depart, arrival, flightTime, airlineCode, sortBy, page } = req.query;

        let baseURL = 'https://api.schiphol.nl/public-flights/flights';

        const params = {
            flightDirection: 'D',
            includedelays: false,
            page: page,
        };

        if (to) params.route = to;
        if (sortBy) params.sort = `-${sortBy}`;
        if (depart) params.fromScheduleDate = depart;
        if (arrival) params.toScheduleDate = arrival;
        if (flightTime) params.scheduleTime = flightTime;
        if (airlineCode) params.airline = airlineCode;

        const response = await axios.get(baseURL, {
            headers: {
                'Accept': 'application/json',
                'app_id': process.env.APP_ID,
                'app_key': process.env.KEY,
                'ResourceVersion': process.env.RESOURCE_VERSION
            },
            params: params,
        });

        const flights = response?.data?.flights || [];

        if (flights.length === 0) {
            return res.status(200).send({ success: true, flights: [] });
        }

        const packageNames = ['Light', 'Flex', 'Comfort', 'Plus', 'Premium+'];
        const tripTypes = ['One Way', 'Round Trip'];

        let destinations = [];

        if (fs.existsSync('all_destinations.json')) {
            const fileData = fs.readFileSync('all_destinations.json', 'utf-8');
            destinations = JSON.parse(fileData);
        }

        const newFlights = response.data.flights.map(flight => {
            const farePrice = Math.floor(Math.random() * 201) + 100;

            const randomPackageIndex = Math.floor(Math.random() * packageNames.length);
            const selectedPackage = {
                packageName: packageNames[randomPackageIndex],
                price: farePrice
            };

            const randomTripTypeIndex = Math.floor(Math.random() * tripTypes.length);
            const selectedTripType = tripTypes[randomTripTypeIndex];

            const flightDestination = flight?.route?.destinations[0];
            let destinationCity = '';

            if (destinations.length > 0 && flightDestination) {
                const destination = destinations.find(a => flightDestination === a.iata);
                destinationCity = destination ? destination.city : '';
            }

            return {
                ...flight,
                farePrice,
                departureCode: params.flightDirection == 'D' ? 'AMS' : to,
                tripType: selectedTripType,
                farePackage: [selectedPackage],
                destinationCity: destinationCity,
                departureCity: params.flightDirection == 'D' ? 'Amsterdam' : destinationCity
            };
        });
        
        res.status(201).send({ success: true, flights: newFlights });
    } catch (err) {
        console.log(err.response)
        res.status(400).json({ success: false, error: "Flight not found.", details: err?.details?.message });
    }
}

const fetchAllDestinations = async () => {
    let page = 480;
    let hasMorePages = true;
    let allResults = [];

    while (hasMorePages) {
        try {
            const response = await axios.get(`https://api.schiphol.nl/public-flights/destinations`, {
                headers: {
                    'Accept': 'application/json',
                    'app_id': process.env.APP_ID,
                    'app_key': process.env.KEY,
                    'ResourceVersion': process.env.RESOURCE_VERSION
                },
                params: {
                    page: page,
                    sort: '+iata',
                },
            });

            await sleep(100);

            const destinations = response.data.destinations || [];
            allResults.push(...destinations);


            if (page % 10 === 0) {
                let previousData = [];

                if (fs.existsSync('all_destinations.json')) {
                    const fileData = fs.readFileSync('all_destinations.json', 'utf-8');
                    previousData = JSON.parse(fileData);
                }

                const combinedResults = previousData.concat(allResults);

                fs.writeFileSync('all_destinations.json', JSON.stringify(combinedResults, null, 2));
                console.log(`Saved page ${page} results to all_destinations.json`);

                allResults = [];
                await sleep(1000);
            }

            if (destinations.length === 0) {
                hasMorePages = false;
            } else {
                page++;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            hasMorePages = false;
        }
    }

};

const fetchAllAirlines = async () => {
    let page = 0;
    let hasMorePages = true;
    let allResults = [];

    while (hasMorePages) {
        try {
            const response = await axios.get(`https://api.schiphol.nl/public-flights/airlines`, {
                headers: {
                    'Accept': 'application/json',
                    'app_id': process.env.APP_ID,
                    'app_key': process.env.KEY,
                    'ResourceVersion': process.env.RESOURCE_VERSION
                },
                params: {
                    page: page,
                    sort: '+iata',
                },
            });

            await sleep(100);

            const airlines = response.data.airlines || [];
            allResults.push(...airlines);


            if (page % 2 === 0) {
                let previousData = [];

                if (fs.existsSync('airlines.json')) {
                    const fileData = fs.readFileSync('airlines.json', 'utf-8');
                    previousData = JSON.parse(fileData);
                }

                const combinedResults = previousData.concat(allResults);

                fs.writeFileSync('airlines.json', JSON.stringify(combinedResults, null, 2));
                console.log(`Saved page ${page} results to airlines.json`);

                allResults = [];
                await sleep(1000);
            }



            if (airlines.length === 0 || page == 19) {

                hasMorePages = false;
                break;
            } else {
                page++;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            hasMorePages = false;
        }
    }

};


