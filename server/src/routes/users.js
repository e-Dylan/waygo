const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const sql_db = require('../sql_db');

router.post('/login', (req, res) => {

    console.log("session id: " + req.session.id);
  
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
  
    username = username.toLowerCase();
  
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
            console.log(req.session);
  
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
  
  router.post('/logout', (req, res) => {
    console.log("loggint out: session id: " + req.session);
    // If user is signed in, destroy session
    if (req.session.userID) {
      req.session.destroy();
      res.json({
        success: true
      });
      return true;
    } else {
      console.log("no session id: \n" + req.session.userID);
      // User was not signed in
      res.json({
        success: false
      });
      return false;
    }
  });
  
  router.post('/isLoggedIn', (req, res) => {
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
  
      // FIX HERE. REQ.SESSION.USERID ISNT BEING SET WHEN RELOADING PAGE
      // LOGS USER OUT WHEN REFRESH.
      // SET SESSION.USERID IN REQ PROPERLY WHEN LOGGING IN.
      res.json({
        success: false
      });
    }
  
  });

module.exports = router;