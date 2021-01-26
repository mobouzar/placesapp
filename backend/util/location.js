const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyAQ0EtfGx7B9nRjcUR5tb-SsK9jymD4s8Q';

const getCoordsForAddress = async (address) => {

    // const response = await axios.get(
    //     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    //         address
    //     )}&key=${API_KEY}`
    // );
    
    // const data = response.data;

    // if (!data || data.status === 'ZERO_RESULTS') {
    //     throw new HttpError(
    //         "Could not find location for the specified address.",
    //         422
    //     );
    // }

    const coordinates = {
        lat: Math.random(),
        lng: Math.random(),
    };

    return coordinates;

};

module.exports = getCoordsForAddress;