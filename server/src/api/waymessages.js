const express = require('express');
const Joi = require('joi');

const db = require("../db");
const waymessages = db.get("waymessages"); // waymessage database

const waymessage_schema = Joi.object({
  // data coming from user for a waymessage is:
  // name, message, lat/lng,
  // server inserts the current date-time.

  username: Joi.string()
    .regex(/^[a-zA-ZÀ-ÿ0-9-_]{1,30}$/)
    .required(),

  message: Joi.string()
    .min(1)
    .max(300)
    .required(),

  latitude: Joi.number().greater(-90).less(90),
  longitude: Joi.number().greater(-180).less(180),
})

const router = express.Router();

router.get('/', (req, res) => {
  waymessages
  .find()
  .then(allMessages => {
    res.json(allMessages);
  })
});

// Server receiving request from user, response function
router.post('/', (req, res, next) => {

  const result = waymessage_schema.validate(req.body);
  if (result.error == undefined) {
    // body (user message object) is valid -> no errors
    const { username, message, latitude, longitude } = req.body;
    const userWayMessage = {
      username,
      message,
      latitude,
      longitude,
      // add current time
      date: new Date()
    };
    // insert into DB
    waymessages.insert(userWayMessage)
      .then(insertedWayMessage => {
        // return as response to the server
        res.json(insertedWayMessage);
      });
  } else {
    // forward error onto error handler middleware
    next(result.error);
  }
  
});

module.exports = router;
