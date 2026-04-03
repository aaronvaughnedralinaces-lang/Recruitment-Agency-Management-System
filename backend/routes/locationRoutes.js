const express = require('express');
const router = express.Router();
const { Country, State, City } = require('country-state-city');

// GET all countries
router.get('/countries', (req, res) => {
    try {
        const countries = Country.getAllCountries();
        // Return only isoCode and name
        const formatted = countries.map(c => ({ isoCode: c.isoCode, name: c.name }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET states by country code
router.get('/states/:countryCode', (req, res) => {
    try {
        const { countryCode } = req.params;
        const states = State.getStatesOfCountry(countryCode);
        // Return code and name
        const formatted = states.map(s => ({ code: s.isoCode, name: s.name }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET cities by country code and state code
router.get('/cities/:countryCode/:stateCode', (req, res) => {
    try {
        const { countryCode, stateCode } = req.params;
        const cities = City.getCitiesOfState(countryCode, stateCode);
        // Return name only (or full object)
        const formatted = cities.map(c => ({ name: c.name }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;