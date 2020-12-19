const app = require('./isLoggedIn');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const sql_db = require('./sql_db');	

const register_schema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'ca', 'co', 'io', 'app', 'shop', 'xyz']}})
        .required(),
		
	password: Joi.string()
		.pattern(new RegExp('^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{3,30}$'))
		.required(),
});

app.post('/api/register', async (req, res) => {
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
            msg: "Please enter valid user information.\nEmail and Password must be between 3 - 30 characters.",
        });
        return;
	}
	
	await sql_db.end();
});

module.exports = app;