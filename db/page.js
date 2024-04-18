const db = require("./");

async function insert({ id, htmlContent }) {
  const timestamp = new Date().toISOString();
  const query = `
    INSERT INTO Pages
    (
      id,
      source_code,
      date_created,
      date_updated
    ) VALUES (
      "${id}",
      "${htmlContent}",
      "${timestamp}",
      "${timestamp}"
    );
  `;
  const success = await db.exec(query);
  return success;
}

async function get({ id }) {
  const query = `
    SELECT *
    FROM Pages
    WHERE id = '${id}'
  `;
  const rows = await db.all(query);
  return rows[0];
}

async function getAll() {
  const query = `
    SELECT *
    FROM Pages
    ORDER BY date_created
    DESC
  `;
  return db.all(query);
}

async function del({ id }) {
  const query = `
      DELETE FROM Pages WHERE id = '${id}'
    `;
  return db.all(query);
}

module.exports = { insert, get, getAll, del };
