import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "finance_track",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool;