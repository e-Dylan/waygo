const app = require('./index');
const sql_db = require('./sql_db');

app.post('/api/logout', async (req, res) => {
	var cols = [req.session.userID];
	sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {		
		// If user is signed in, destroy session
		if (req.session.userID) {
			var sessionID = req.session;
			req.session.destroy();

			const userData = {
				username: data[0].username,
				password: data[0].password,
				email: data[0].email,
				session: sessionID,
			}
			console.log(`User logged out: ${JSON.stringify(userData, null, 4)}`);

			res.json({
				success: true,
				msg: "Successfuly logged out.",
			});
			return true;
		} else {
			console.log("no session id: \n" + req.session.userID);
			// User was not signed in
			res.json({
				success: false,
				msg: "Error: Failed to logout - user is not logged in."
			});
			return false;
		}
	});

	await sql_db.end();
});

module.exports = app;