import { db } from "../mysql.js";

const select_stadium_by_statuscode = "SELECT main_region as 지역, stadium_name as 구장명, contact_phone as 번호, ground_type as 구장타입 FROM PFB_STADIUM WHERE STATUS_CODE = ?";

export async function getAllOperatingStadium() {
  return db.execute(`${select_stadium_by_statuscode}`, [1]).then((result) => result[0]);
}

export async function getAllWaitStadium() {
  return db.execute(`${select_stadium_by_statuscode}`, [0]).then((result) => result[0]);
}