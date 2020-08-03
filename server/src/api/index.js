const express = require('express');

const messages = require('./waymessages');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/waymessages', messages);

module.exports = router;
