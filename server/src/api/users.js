const express = require('express');
const Joi = require('joi');

const db = require("../db");
const users = db.get("users"); // user database

const user_schema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(18)
    .required(),

  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

const router = express.Router();

router.get('/', (req, res) => {
  res.json([]);
});

router.post('/', (req, res, next) => {
  res.json([]);
});

module.exports = router;
