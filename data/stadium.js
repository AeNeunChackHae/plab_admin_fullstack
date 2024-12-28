import { db } from "../mysql.js";

const select_stadium_by_statuscode = "SELECT id, main_region, stadium_name, contact_phone, ground_type FROM PFB_STADIUM WHERE STATUS_CODE = ?";

const select_stadium_by_id = "SELECT * FROM PFB_STADIUM WHERE ID = ?"

const insert_stadium = `
    INSERT INTO
      PFB_STADIUM
      (status_code, photo_path, stadium_name, full_address, contact_phone, contact_email, main_region
      , sub_region, ground_type, parking_yn, width, height, notice, shower_yn, sell_drink_yn, lend_shoes_yn, toilet_yn, lend_vest_yn, lend_ball_yn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

const update_stadium_statuscode = 'UPDATE PFB_STADIUM SET status_code = ? WHERE id = ?'

export async function getAllOperatingStadium() {
  return db.execute(select_stadium_by_statuscode, [1]).then((result) => result[0]);
}

export async function getAllWaitStadium() {
  return db.execute(select_stadium_by_statuscode, [0]).then((result) => result[0]);
}

export async function getStadiumOneById(id){
  return db.execute(select_stadium_by_id, [id]).then(result => result[0][0]); // PK로 단 건 조회라서 한 번 더 인덱싱
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
      ]).then(result => result[0].insertId);
  } catch (error) {
      console.error('Error inserting data:', error);
      return null;
  }
}