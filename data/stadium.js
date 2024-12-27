import { db } from "../mysql.js";

const select_stadium_by_statuscode = "SELECT main_region as 지역, stadium_name as 구장명, contact_phone as 번호, ground_type as 구장타입 FROM PFB_STADIUM WHERE STATUS_CODE = ?";

const insert_stadium = `
    INSERT INTO
      PFB_STADIUM
      (status_code, photo_path, stadium_name, full_address, contact_phone, contact_email, main_region
      , sub_region, ground_type, parking_yn, width, height, notice, shower_yn, sell_drink_yn, lend_shoes_yn, toilet_yn, lend_vest_yn, lend_ball_yn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

export async function getAllOperatingStadium() {
  return db.execute(`${select_stadium_by_statuscode}`, [1]).then((result) => result[0]);
}

export async function getAllWaitStadium() {
  return db.execute(`${select_stadium_by_statuscode}`, [0]).then((result) => result[0]);
}

export async function insertStadium(data){
  try {
      return db.execute(insert_stadium, [
        data.status_code,
        data.photo_path,
        data.stadium_name,
        data.full_address,
        data.contact_phone,
        data.contact_email,
        data.main_region,
        data.sub_region,
        data.ground_type,
        data.parking_yn,
        data.width,
        data.height,
        data.notice,
        data.shower_yn,
        data.sell_drink_yn,
        data.lend_shoes_yn,
        data.toilet_yn,
        data.lend_vest_yn,
        data.lend_ball_yn
      ]).then(result => result);
  } catch (error) {
      console.error('Error inserting data:', error);
      return null;
  }
}