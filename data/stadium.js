import { db } from "../mysql.js";

const SELECT_ALL_WAIT_STADIUM =
  "SELECT * FROM PFB_STADIUM WHERE STATUS_CODE = ?";

export async function getAllWaitStadium() {
  return db.execute(`${SELECT_STADIUM_ALL}`, [0]).then((result) => result[0]);
}
