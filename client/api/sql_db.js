const serverlessMySQL = require('serverless-mysql');

const deploy = process.env.NODE_ENV === 'production' ? 'production' : 'development';

var sql_db_port;
var host;
var user;
var password;
var database;

if (deploy === 'production') {
	// REMOTE HOST
	sql_db_port = 3306;
	host = 'sql9.freemysqlhosting.net';
	user = 'sql9380874';
	password = 'UenAiZQTdp';
	database = 'sql9380874';
} else if (deploy === 'development') {
	// LOCALHOST:
	sql_db_port = 3308;
	host = 'localhost';
	user = 'root'
	password = 'root'
	database = 'waygo_db';
}

const sql_db = serverlessMySQL({
	config: {
		host: host,
		user: user,
		password: password,
		port: sql_db_port,
		database: database,
	}
})

module.exports = sql_db;