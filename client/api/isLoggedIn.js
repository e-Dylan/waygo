const app = require('./index');
const sql_db = require('./sql_db');

app.post('/api/isLoggedIn', async (req, res) => {
	// Connect to mySQL user database

	// sql_db.query('SELECT * FROM user WHERE id = 1 LIMIT 1', (err, data, fields) => {
	// 	console.log(data);
	// 	res.json({
	// 		data: data
	// 	});
	// })

	if (req.session) {
		// session.userID is set to db id to the req when user logs in.
		console.log("checking if user is logged in, session: " + req.session);
		if (req.session.userID) {
			let cols = [req.session.userID];
			sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {
				// if the session user's id matches one in the db, they're logged in.
				if (data && data.length === 1) {
					res.json({
						success: true,
						username: data[0].username
					});
					return true;
				}
				else // no data matches from the db, no user.
				{
					res.json({
						success: false
					});
				}

			});
		}
		else // User has no session id.
		{
			res.json({
				success: false
			});
		}

		await sql_db.end();
	} else {
		console.log('no session, erroring');
		res.json({
			msg: "no session, erroring",
		});
	}
});

module.exports = app;