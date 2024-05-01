const DATABASE_PATH = process.env.DATABASE_PATH || "./.data/db.sqlite3";
const successMessage = `SQLite Database at ${DATABASE_PATH} opened successfully.`;
const callback = require("./callback")(successMessage);
const setup = require("./setup");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(DATABASE_PATH, callback);

const run = async (query, params = []) => {
  return await new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

const all = async (query, params = []) => {
  return await new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

setup(run);

module.exports = {
  run,
  all,
};
