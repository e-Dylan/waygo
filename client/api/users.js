const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const router = express.Router();

const sql_db = require('../sql_db');

const register_schema = Joi.object({
    username: Joi.string()
        .regex(/^[a-zA-ZÀ-ÿ0-9-_]{3,18}$/)
        .required(),

    email: Joi.string()
        .email({minDomainSegments: 2, tlds: {allow: ['com', 'net']}})
        .required(),

    password: Joi.string()
        .regex(/^[a-zA-ZÀ-ÿ0-9-_]{3,26}$/)
        .required()
});

app.post('/register', (req, res) => {
    console.log('[attempting to register user into database...]\n\n session id: ' + req.session.id);

    const result = register_schema.validate(req.body);
    if (result.error === undefined) {
        // user entered valid registration credentials, insert into db

        const { username, email, password } = req.body;

        // encrypt password with bcrypt
        const salt = bcrypt.genSaltSync(10);
        var hashed_password = bcrypt.hashSync(password, salt);

        let values = [username, email, hashed_password];

        sql_db.query("INSERT INTO user(username, email, password) VALUES(?, ?, ?)", values, (err, data, fields) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "Error registering data into database.",
                });
                return;
            }

            console.log(values);

            // User has been registered and inserted into database
            // data == [id, user, email, password] data from user inserted
            if (data) {
                res.json({
                    success: true,
                    username: values[0],
                    msg: "Successfully inserted user into database.",
                    data: values,
                });

                let userJson = {
                    username: values[0],
                    email: values[1],
                    password_hash: values[2],
                };
                console.log("[Successfuly registered user into user database.]\n" + JSON.stringify(userJson));
            }
        });
    }
    else
    {
        // User entered invalid registration information -> Failed joi schema
        res.json({
            success: false,
            msg: "Please enter valid user information. What do you think this is?",
        });
        return;
    }
});

app.post('/login', (req, res) => {

    console.log("session id: " + req.session.id);
  
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
  
    // User login info validation
    if (username.length > 16 || password.length > 16) {
      res.json({
        success: false,
        msg: 'Username and password must be shorter than 16 characters.'
      });
      return;
    }
  
    // Check if username exists in db
    let cols = [username];
    sql_db.query("SELECT * FROM user WHERE username = ? LIMIT 1", cols, (err, data, fields) => {
      if (err) {
        // No username in the database matching login username
        res.json({
          success: false,
          msg: 'User does not exist.'
        });
        return;
      }
  
      // Found a user with this username
      // data = data array returned from db query
      if (data && data.length === 1) {
        // compare username's hashed password with db password
        bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
          // password is the same
          if (verified) {
  
            // Log the user in. Start a session for user.
            req.session.userID = data[0].id;
            req.session.save((err) => {
              if (err) {
                console.log(err);
              }
			});
			const userData = {
				username: data[0].username,
				password: password,
				email: data[0].email,
				session: req.session,
			}
            console.log(`User successfully logging in: ${JSON.stringify(userData, null, 4)}`);
  
            res.json({
              success: true,
              username: data[0].username,
            });
  
            return;
          }
  
          else {
            // Not verified, wrong password.
            res.json({
              success: false,
              msg: 'Incorrect password.'
            });
          }
  
        });
      }
      else // User does not exist in database.
      {
        res.json({
          success: false,
          msg: 'User not found. Please try again.'
        });
      }
      
    });
  })
  
app.post('/logout', (req, res) => {
	var cols = [req.session.userID];
	sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {		
		// If user is signed in, destroy session
		if (req.session.userID) {
			var sessionID = req.session;
			req.session.destroy();

			const userData = {
				username: data[0].username,
				password: data[0].password,
				email: data[0].email,
				session: sessionID,
			}
			console.log(`User logged out: ${JSON.stringify(userData, null, 4)}`);

			res.json({
				success: true,
				msg: "Successfuly logged out.",
			});
			return true;
		} else {
			console.log("no session id: \n" + req.session.userID);
			// User was not signed in
			res.json({
				success: false,
				msg: "Error: Failed to logout - user is not logged in."
			});
			return false;
		}
	});
});
  
router.post('/api/isLoggedIn', (req, res) => {
	// session.userID is set to db id to the req when user logs in.
	console.log("checking if logged in - session: " + req.session);
	if (req.session.userID) {
		let cols = [req.session.userID];
		sql_db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {
			// if the session user's id matches one in the db, they're logged in.
			if (data && data.length === 1) {
				res.json({
				success: true,
				username: data[0].username
				});
				return true;
			}
			else // no data matches from the db, no user.
			{
				res.json({
				success: false
				});
			}

		});
	}
	else // User has no session id.
	{
		res.json({
			success: false
		});
	}

});

module.exports = router;