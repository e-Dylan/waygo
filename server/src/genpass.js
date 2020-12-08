const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("password", salt);

console.log(hash);