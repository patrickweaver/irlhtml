const DATABASE_PATH = process.env.DATABASE_PATH || './.data/db.sqlite3';
const successMessage = `SQLite Database at ${DATABASE_PATH} opened successfully.`;
const callback = require('./callback')(successMessage);
const setup = require('./setup');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_PATH, callback);

const exec = async query => {
  return await new Promise((resolve, reject) => {
    db.all(query, [], (err) => {
        if (err) {
            reject(err);
        }
        resolve(true);
    });
  });
}

const all = async query => {
  return await new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
        if (err) {
            reject(err);
        }
        resolve(rows);
    });
  });
}

setup(exec);


module.exports = {
  exec: exec,
  all: all,
};