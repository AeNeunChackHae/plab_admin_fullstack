import mysql from "mysql2";
import { config } from "./config.js";
const pool = mysql.createPool({
  host: config.db.db_host,
  user: config.db.db_user,
  database: config.db.db_database,
  password: config.db.db_password,
});
export const db = pool.promise();
