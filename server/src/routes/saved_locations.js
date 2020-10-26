const express = require('express');
const Joi = require('joi');

const router = express.Router();

const sql_db = require('../sql_db');

const location_schema = Joi.object({
    username: Joi.string()
        .regex(/^[a-zA-ZÀ-ÿ0-9-_]{3,18}$/)
        .required(),

    email: Joi.string()
        .email({minDomainSegments: 2, tlds: {allow: ['com', 'net']}})
        .required(),

    password: Joi.string()
        .regex(/^[a-zA-ZÀ-ÿ0-9-_]{3,26}$/)
        .required()
});

router.post('/save_location', (req, res) => {
	// take input form (location name/address, lng, lat) and input into json savedlocs col in user table



});

router.post('req_location', (req, res) => {
	// request the json object for user's saved locations, return to front-end
	// to be displayed for user in ui.
	

});