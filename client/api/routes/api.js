const express = require('express');

const users_router = require('./users');
const saved_locations_router = require('./savedLocations');
const router = express.Router();

// Use each router (users router, waymessage router) on this router to combine them.
// Export it to be used on main express app in main.js.
router.use('/', users_router);
router.use('/', saved_locations_router);

module.exports = router;