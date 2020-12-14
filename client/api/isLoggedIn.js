// export default (req, res) => {
// 	const mysql = require('mysql');

// 	const deploy = 'production';

// 	var sql_db_port;
// 	var host;
// 	var user;
// 	var password;
// 	var database;

// 	if (deploy === 'production') {
// 		// REMOTE HOST
// 		sql_db_port = 3306;
// 		host = 'sql9.freemysqlhosting.net';
// 		user = 'sql9380874';
// 		password = 'UenAiZQTdp';
// 		database = 'sql9380874';
// 	} else if (deploy === 'localhost') {
// 		// LOCALHOST:
// 		sql_db_port = 3308;
// 		host = 'localhost';
// 		user = 'root'
// 		password = 'root'
// 		database = 'waygo_db';
// 	}

// 	// Database connection
// 	const sql_db = mysql.createConnection({
// 		host: host,
// 		user: user,
// 		password: password,
// 		port: sql_db_port,
// 		database: database,
// 	}); 

// 	// Connect to mySQL user database
// 	sql_db.connect((err) => { 
// 		if (err) {
// 			console.log('ERROR: database connection error.');
// 			throw(err);
// 			return false;
// 		} else {
// 			console.log(`Connected to mysql database for users`);
// 		}
// 	});

// 	// session.userID is set to db id to the req when user logs in.
// 	console.log("checking if logged in - session: " + req.session);
// 	if (req.session.userID) {
// 		let cols = [req.session.userID];
// 		sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {
// 			// if the session user's id matches one in the db, they're logged in.
// 			if (data && data.length === 1) {
// 				res.json({
// 				success: true,
// 				username: data[0].username
// 				});
// 				return true;
// 			}
// 			else // no data matches from the db, no user.
// 			{
// 				res.json({
// 					success: false
// 				});
// 			}

// 		});
// 	}
// 	else // User has no session id.
// 	{
// 		res.json({
// 			success: false
// 		});
// 	}
// };