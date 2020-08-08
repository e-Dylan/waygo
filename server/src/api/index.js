const express = require('express');

// Waymessages are stored in a mongo json database, fetched using monk with express router.
const waymessages = require('./waymessages');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/waymessages', waymessages);

module.exports = router;
