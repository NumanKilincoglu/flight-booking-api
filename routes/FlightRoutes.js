import express from 'express';
const router = express.Router();
import axios from 'axios'

router.get("/search", async (req, res) => {
  try {

    const filters = req.query;

    let baseURL = 'https://api.schiphol.nl/public-flights/flights?includedelays=false&page=0';

    const response = await axios.get(baseURL, {
      headers: {
        'Accept': 'application/json',
        'app_id': 'f152d8e0',
        'app_key': '8738d27123ddf3fa810a8c084cc35583',
        'ResourceVersion': 'v4'
      },
      withCredentials: true
    },
    );

    if (response?.data?.flights?.length == 0) return res.status(201).send({ success: true, flights: [] });

    console.log(response.data.flights[0]);

    res.status(201).send({ success: true, flights: response.data.flights });
  } catch (err) {
    res.status(400).json({ success: false, error: "Flight not found.", details: err });
  }
});

export default router;
