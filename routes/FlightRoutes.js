import express from 'express';
const router = express.Router();
import axios from 'axios'
import fs from 'fs';
import { dateConvert } from '../utils/DateConvert.js';
import dotenv from 'dotenv';
dotenv.config()

export const fetchAllDestinations = async () => {
  let page = 480;
  let hasMorePages = true;
  let allResults = [];

  while (hasMorePages) {
    try {
      const response = await axios.get(`https://api.schiphol.nl/public-flights/destinations`, {
        headers: {
          'Accept': 'application/json',
          'app_id': 'f152d8e0',
          'app_key': '8738d27123ddf3fa810a8c084cc35583',
          'ResourceVersion': 'v4',
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

export const fetchAllAirlines = async () => {
  let page = 0;
  let hasMorePages = true;
  let allResults = [];

  while (hasMorePages) {
    try {
      const response = await axios.get(`https://api.schiphol.nl/public-flights/airlines`, {
        headers: {
          'Accept': 'application/json',
          'app_id': 'f152d8e0',
          'app_key': '8738d27123ddf3fa810a8c084cc35583',
          'ResourceVersion': 'v4',
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

router.get("/destinations", async (req, res) => {
  try {

    const search = req.query.search;

    if (fs.existsSync('all_destinations.json')) {
      const fileData = fs.readFileSync('all_destinations.json', 'utf-8');
      const parsed = JSON.parse(fileData);

      const filteredDestinations = parsed.filter(destination =>
      (destination?.city?.toLowerCase().includes(search.toLowerCase())
        || (destination?.country?.toLowerCase().includes(search.toLowerCase())))
      );

      if (filteredDestinations?.length == 0) {
        return res.status(201).send({ success: true, destinations: [] });
      }

      return res.status(201).send({ success: true, destinations: filteredDestinations.slice(0, 10) });

    }

  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, error: "Flight not found.", details: err });
  }
});

router.get("/airlines", async (req, res) => {

  try {

    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (fs.existsSync('airlines.json')) {
      const fileData = fs.readFileSync('airlines.json', 'utf-8');
      const parsed = JSON.parse(fileData);

      const filteredParsed = parsed.filter(airline => airline.iata && airline.publicName);
      const sorted = filteredParsed.sort((a, b) => a.publicName.localeCompare(b.publicName));

      const startIndex = (parsedPage - 1) * parsedLimit;
      const endIndex = startIndex + parsedLimit;
      const filteredAirlines = sorted.slice(startIndex, endIndex);

      if (filteredAirlines.length === 0) {
        return res.status(200).send({ success: true, airlines: [], message: "No airlines found." });
      }

      return res.status(200).send({
        success: true,
        airlines: filteredAirlines,
        currentPage: parsedPage,
        totalPages: Math.ceil(parsed.length / parsedLimit),
        totalAirlines: parsed.length,
      });
    }

    return res.status(404).send({ success: false, error: "File not found." });

  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, error: "Error fetching airlines.", details: err });
  }
});

router.get("/search", async (req, res) => {
  try {

    const { from, to, depart, arrival, airlineCode, sortBy, page } = req.query;

    let baseURL = 'https://api.schiphol.nl/public-flights/flights';

    const params = {
      flightDirection: 'D',
      includedelays: false,
      page: page,
    };

    if (to) {
      params.route = to;
    }

    if (sortBy) {
      params.sort = '-' + sortBy;
    }

    if (depart) {
      params.fromDateTime = dateConvert(depart);
    }

    if (arrival) {
      params.toDateTime = dateConvert(arrival);
    }

    if (airlineCode) {
      params.airline = airlineCode;
    }

    const response = await axios.get(baseURL, {
      headers: {
        'Accept': 'application/json',
        'app_id': process.env.APP_ID,
        'app_key': process.env.KEY,
        'ResourceVersion': process.env.RESOURCE_VERSION
      },
      params: params,
    });

    if (!response.data.flights || response?.data?.flights?.length == 0) return res.status(201).send({ success: true, flights: [] });

    const packageNames = ['Light', 'Flex', 'Comfort', 'Plus', 'Premium+'];
    const tripTypes = ['One Way', 'Round Trip'];

    const newFlights = response.data.flights.map(flight => {
      const farePrice = Math.floor(Math.random() * 201) + 100;

      const randomPackageIndex = Math.floor(Math.random() * packageNames.length);
      const selectedPackage = {
        packageName: packageNames[randomPackageIndex],
        price: farePrice
      };

      const randomTripTypeIndex = Math.floor(Math.random() * tripTypes.length);
      const selectedTripType = tripTypes[randomTripTypeIndex];

      return {
        ...flight,
        farePrice,
        departureCode: params.flightDirection == 'D' ? 'AMS' : to,
        tripType: selectedTripType,
        farePackage: [selectedPackage]
      };
    });

    res.status(201).send({ success: true, flights: newFlights });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, error: "Flight not found.", details: err?.details?.message });
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default router;
