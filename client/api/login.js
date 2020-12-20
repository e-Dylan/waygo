const bcrypt = require('bcryptjs');

const sql_db = require('./sql_db');

const app = require('./isLoggedIn');

app.post('/api/login', async (req, res) => {

	console.log("session id: " + req.session.id);

	var { username, password } = req.body;
	console.log(`[/login] Attempting to login user:\n\nusername: ${username}\n`);
	username = username.toLowerCase();

	// User login info validation
	if (username.length > 35 || password.length > 35) {
		res.json({
			success: false,
			msg: 'Fields must be shorter than 35 characters and must be alphanumeric (no special characters).'
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

				console.log(`[/login] User successfully logging in: ${JSON.stringify(userData, null, 4)}\n`);
				res.json({
					success: true,
					msg: `Welcome ${data[0].username}.`,
					username: data[0].username,
				});
				return;
			} else {
				// Not verified, wrong password.
				console.log(`[/login] User entered wrong password:\n\nusername: ${username}\n`);
				res.json({
					success: false,
					msg: "Password doesn't match your username."
				});
			}

			});
		}
		else // User does not exist in database.
		{
			res.json({
				success: false,
				msg: 'User not found. You may have misspelled your username. If you do not have an account, register for free for some useful features!'
			});
		}
	});
	
	await sql_db.end();
});

module.exports = app;