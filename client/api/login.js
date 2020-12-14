const bcrypt = require('bcryptjs');
const Joi = require('joi');

const sql_db = require('./sql_db');

const app = require('./index');

app.post('/api/login', async (req, res) => {

	console.log("session id: " + req.session.id);


	var { username, password } = req.body;
	username = username.toLowerCase();

	// User login info validation
	if (username.length > 16 || password.length > 16) {
		res.json({
			success: false,
			msg: 'Username and password must be shorter than 16 characters.'
		});
		return;
	}

	// Check if username exists in db
	let cols = [username];
	sql_db.query("SELECT * FROM user WHERE username = ? LIMIT 1", cols, (err, data, fields) => {
		if (err) {
			// No username in the database matching login username
			res.json({
				success: false,
				msg: 'User does not exist.'
			});
			return;
		}

		// Found a user with this username
		// data = data array returned from db query
		if (data && data.length === 1) {
		// compare username's hashed password with db password
		bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
			// password is the same
			if (verified) {

				// Log the user in. Start a session for user.
				req.session.userID = data[0].id;
				req.session.save((err) => {
					if (err) {
						console.log(err);
					}
				});
				const userData = {
					username: data[0].username,
					password: password,
					email: data[0].email,
					session: req.session,
				}
				console.log(`User successfully logging in: ${JSON.stringify(userData, null, 4)}`);

				res.json({
					success: true,
					username: data[0].username,
				});

				return;
				}

				else {
				// Not verified, wrong password.
				res.json({
					success: false,
					msg: 'Incorrect password.'
				});
				}

			});
		}
		else // User does not exist in database.
		{
			res.json({
				success: false,
				msg: 'User not found. Please try again.'
			});
		}
	});
	
	await sql_db.end();
});

module.exports = app;