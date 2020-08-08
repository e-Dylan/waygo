// const express = require('express');
// const Joi = require('joi');
const bcrypt = require('bcryptjs');

// const mongodb_db = require("../mongodb_db");
// const users = db.get("users"); // user database

// const user_schema = Joi.object({
//   username: Joi.string()
//     .alphanum()
//     .min(2)
//     .max(18)
//     .required(),

//   password: Joi.string()
//     .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

//   email: Joi.string()
//     .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
// })

// const router = express.Router();

// router.get('/', (req, res) => {
//   res.json([]);
// });

// router.post('/', (req, res, next) => {
//   res.json([]);
// });

// module.exports = router;

let pass = bcrypt.hashSync("12345", 9);
console.log(pass);