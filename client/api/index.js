const app = require('express')();

app.get('/api', (req, res) => {
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
	res.end('Hello! Rerouted using serverless express!');
});

module.exports = app;