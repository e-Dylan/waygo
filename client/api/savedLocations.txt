const express = require('express');
const Joi = require('joi');

const router = express.Router();

const sql_db = require('./sql_db');

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

router.post('/saveLocation', async (req, res) => {
	// take input form (location name/address, lng, lat) and input into json savedlocs col in user table
	console.log("saving location to user's saved locations...");
	
	var body = req.body;
	var locationData = {
		title: body.title,
		address: body.address,
		lng: body.lng,
		lat: body.lat
	};

	// check to make sure full location is being saved.
	// if (!req.title || !req.place_name || !req.lat || !req.lng)
		// return;

	// user has active session, is logged in, used to find user in db
	if (req.session.userID) {
		let uid = [req.session.userID];

		var values;

		sql_db.query('SELECT savedlocs FROM user WHERE id = ? LIMIT 1', uid, (err, data, fields) => {
		
			if (err) {
				res.json({
					success: false,
					msg: "Error fetching user data from the database."
				});
				return;
			}

			if (JSON.parse(data[0].savedlocs) != null) {
				// data returned is not null, savedlocs already has data in it.
				// console.log(data);
				
				var savedData = JSON.parse(data[0].savedlocs)
				// append savedlocs array with new location (stringified)
				savedData.push(locationData);

				var savedDataString = JSON.stringify(savedData);

				values = [savedDataString, uid] // user savedlocs array
				
				// overwrite db with that new array.
				sql_db.query('UPDATE user SET savedlocs = ? WHERE id = ?', values, (err, data, fields) => {
					if (err) {
						res.json({
							success: false,
							msg: "Error inserting user saved location into database - updated existing array."
						});
					} else {
						res.json({
							success: true,
							msg: "Successfully inserted user saved location into database. updated existing array.",
							savedLocations: savedData,
						});
					}
				});
			} else {
				// savedlocs is null, make a new array and save that.
				var newSavedLocs = [locationData] // array that will be the DB, return this on set.
				var toSave = JSON.stringify(newSavedLocs);
				values = [toSave, uid]
				sql_db.query('UPDATE user SET savedlocs = ? WHERE id = ?', values, (err, data, fields) => {
					if (err) {
						res.json({
							success: false,
							msg: "Error inserting user saved location into database - attempted to set new on a null value.",
						});
					} else {
						res.json({
							success: true,
							msg: "Successfully inserted user saved location into database. Inserted into null initial value.",
							savedLocations: newSavedLocs
						});
					}
				});
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
			msg: "User had no session id - not logged in.",
		});
	}

});

router.post('/deleteSavedLocation', (req, res) => {
	// Called to delete a saved location by array index from user's savedlocs col in database.
	// req.body: index -> comes as stringified object
	const index = JSON.parse(req.body.index);
	console.log(index);

	if (req.session.userID) {

		let uid = [req.session.userID];

		sql_db.query('SELECT savedlocs FROM user WHERE id = ? LIMIT 1', uid, (err, data, fields) => {
		
			// user should never be able to call delete if they have no locations,
			// but check if their locs array isn't defined yet, or empty.
			if (err || data[0].savedlocs === null || data[0].savedlocs.length <= 0) {
				res.json({
					success: false,
					msg: "Error fetching user data from the database."
				});
				return;
			}

			// delete index in current data array
			var savedData = JSON.parse(data[0].savedlocs);
			savedData.splice(index, 1);

			var savedDataString = JSON.stringify(savedData);

			// overwrite db with new locations array
			var values = [savedDataString, uid]
			sql_db.query('UPDATE user SET savedlocs = ? WHERE id = ?', values, (err, data, fields) => {
				if (err) {
					res.json({
						success: false,
						msg: "Error deleting location from user account."
					})
				} else {
					// user successfully overwrote their savedlocs array:
					res.json({
						success: true,
						msg: "Successfully deleted location from user account.",
						savedLocations: savedData,
					});
				}
			});
		});
	}
})

module.exports = router;