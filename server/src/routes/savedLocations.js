const express = require('express');
const Joi = require('joi');

const router = express.Router();

const sql_db = require('../sql_db');

const locationSchema = Joi.object({
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

router.post('/saveLocation', (req, res) => {
	// take input form (location name/address, lng, lat) and input into json savedlocs col in user table
	console.log("saving location to user's saved locations...");
	
	// check to make sure full location is being saved.
	// if (!req.title || !req.place_name || !req.lat || !req.lng)
		// return;

	// user has active session, is logged in, used to find user in db
	if (req.session.userID) {
		let uid = [req.session.userID];
		sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', uid, (err, data, fields) => {
			// already has saved locations, and an array initialized in db.
			if (data) { // savedlocs cell already has data in it.
				// let currentLocationsArr = JSON.parse(data[0].savedlocs);
				

				/*
					TAKE ARRAY OUT OF THE CELL, PARSE BACK INTO ARRAY
					PUSH NEW LOCATION OBJECT INTO IT
					OVERWRITE (REPLACE) CURRENT CELL DATA WITH UPDATED CELL.
					
					SAME THING TO REMOVE LOCATION OBJECTS.
				*/

				// insert saved location object into database array
				sql_db.query('FIX REPLACE HERE.', (err, data, fields) => {
					if (err) {
						res.json({
							success: false,
							msg: "Error inserting saved location into database."
						})
						return;
					}

					console.log(values);

					// data == [id, user, email, password, savedlocs] from user's row in db.
					if (data) { // data was returned from sql query.
						res.json({
							success: true,
							msg: "Successfully saved user location into database.",
							savedLocation: req.body,
						})
						// for server-side terminal
						console.log("Successfully saved location for id: ${req.session.userID}");
					}
				});
			} else { // new user, no saved locations prior, no array yet. col is still NULL.
				// make a new array with saved location
				
				// insert into db

			}
		});
	}

});

router.get('/reqSavedLocations', (req, res) => {
	// request the json object for user's saved locations, return to front-end
	// to be displayed for user in ui.
	console.log("returning user's saved locations as json...");
	// session.userID is set to db id, shown in req, when user logs in.
	if (req.session.userID) {
		// finding user in db by this id.
		let uid = [req.session.userID];
		sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', uid, (err, data, fields) => {
			if (data) {
				res.json({
					success: true,
					savedLocations: data[0].savedlocs,
					msg: "Returned saved locations json object."
				});
				return true;
			} else { // no matches from db, no user stored.
				res.json({
					success: false,
					msg: "No user matched in the database - no data returned."
				});
			}
		});
	} else { // user has no session id, not logged in.
		res.json({
			success: false,
			msg: "User had no session id - not logged in."
		});
	}

});

module.exports = router;