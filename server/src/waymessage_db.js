const monk = require("monk");
const waymessage_db = monk(process.env.DATABASE_URL);

module.exports = waymessage_db;