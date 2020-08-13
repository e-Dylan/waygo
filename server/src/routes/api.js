const express = require('express');
const Joi = require('joi');
const monk = require("monk");

const users_router = require('./users');
const waymessages_router = require('./waymessages');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "API"
    });
});

// Use each router (users router, waymessage router) on this router to combine them.
// Export it to be used on main express app in main.js.
router.use('/', users_router);
router.use('/', waymessages_router);

module.exports = router;