const clear = process.env.CLEAR_ALL_ROWS === "TRUE";
console.log("Clear:", clear, `(${process.env.CLEAR_ALL_ROWS})`)

const successMessage = `Tables created successfully`;

const schema = `
CREATE TABLE IF NOT EXISTS Pages (
  id text NOT NULL PRIMARY KEY,
  source_code text NOT NULL,
  date_created text NOT NULL,
  date_updated text NOT NULL
);
`

const clearQuery = `
  DROP TABLE Pages;
`

module.exports = async (dbExec) => {
  try {
    if (clear) await dbExec(clearQuery)
    await dbExec(schema);
    console.log(successMessage);
  } catch (error) {
    console.log("Error:", error)
  }
}