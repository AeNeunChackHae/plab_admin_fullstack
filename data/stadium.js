import { db } from "../mysql.js";

const select_stadium_by_statuscode = "SELECT id, main_region, stadium_name, ground_type FROM PFB_STADIUM WHERE STATUS_CODE = ?";

const select_stadium_by_id = "SELECT * FROM PFB_STADIUM WHERE ID = ?";

const select_stadium_config_by_id = `SELECT * FROM PFB_STADIUM_CONFIG WHERE stadium_id = ? ORDER BY id`;

const insert_stadium = `
    INSERT INTO
      PFB_STADIUM
      (status_code, photo_path, stadium_name, full_address, contact_email, main_region
      , sub_region, ground_type, parking_yn, width, height, notice, shower_yn, sell_drink_yn, lend_shoes_yn, toilet_yn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

const update_stadium = `
  UPDATE
    PFB_STADIUM
  SET
    status_code = ?,
    photo_path = ?,
    stadium_name = ?,
    full_address = ?,
    contact_email = ?,
    main_region = ?,
    sub_region = ?,
    ground_type = ?,
    parking_yn = ?,
    width = ?,
    height = ?,
    notice = ?,
    shower_yn = ?,
    sell_drink_yn = ?,
    lend_shoes_yn = ?,
    toilet_yn = ?
  WHERE
    id = ?;
`

const update_stadium_without_photo = `
  UPDATE
    PFB_STADIUM
  SET
    status_code = ?,
    stadium_name = ?,
    full_address = ?,
    contact_email = ?,
    main_region = ?,
    sub_region = ?,
    ground_type = ?,
    parking_yn = ?,
    width = ?,
    height = ?,
    notice = ?,
    shower_yn = ?,
    sell_drink_yn = ?,
    lend_shoes_yn = ?,
    toilet_yn = ?
  WHERE
    id = ?;
`

const update_stadium_statuscode = 'UPDATE PFB_STADIUM SET status_code = ? WHERE id = ?';

/* SELECT 구장리스트 (by.정상 운영) */
export async function getAllOperatingStadium() {
  try{
    return db.execute(select_stadium_by_statuscode, [1]).then((result) => result[0]);
  }catch(error){
    console.log('----------getAllOperatingStadium() error----------\n\n\n',error);
    return null;
  }
}

/* SELECT 구장리스트 (by.승인 대기) */
export async function getAllWaitStadium() {
  try{
    return db.execute(select_stadium_by_statuscode, [0]).then((result) => result[0]);
  }catch(error){
    console.log('----------getAllWaitStadium() error----------\n\n\n',error);
    return null;
  }
}

/* SELECT 구장리스트 (by.미운영영) */
export async function getAllIdleStadium() {
  try{
    return db.execute(select_stadium_by_statuscode, [2]).then((result) => result[0]);
  }catch(error){
    console.log('----------getAllIdleStadium() error----------\n\n\n',error);
    return null;
  }
}

/* SELECT 구장 (by.id) */
export async function getStadiumOneById(id){
  try{
    return db.execute(select_stadium_by_id, [id]).then(result => result[0][0]); // PK로 단 건 조회라서 한 번 더 인덱싱
  }catch(error){
    console.log('----------getStadiumOneById(id) error----------\n\n\n',error);
    return null;
  }
}

/* SELECT 구장 설정 (by.id) */
export async function getStadiumConfig(id){
  try{
    return db.execute(select_stadium_config_by_id, [id]).then(result => result[0])
  }catch(error){
    console.log('----------getStadiumConfig(id) error----------\n\n\n',error);
    return null;
  }
}

/* 구장 INSERT (모든 인자값) */
export async function insertStadium(data){
  try {
      return db.execute(insert_stadium, [
        data.status_code,
        data.photo_path,
        data.stadium_name,
        data.full_address,
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
      ]).then(result => result[0].insertId);
  } catch (error) {
    console.log('----------insertStadium(data) error----------\n\n\n',error);
    return null;
  }
}

export async function insertStadiumConfig(paramList){
  console.log('data / insertStadiumConfig(paramList) 인자값: \n', paramList);

  const values = paramList.map(data =>
    `(${data.stadium_id}, ${db.escape(data.match_type)}, ${db.escape(data.allow_gender)}, ${db.escape(data.level_criterion)}, ${db.escape(data.match_start_time)}, ${db.escape(data.match_end_time)})`
  ).join(', ');

  console.log('data / insertStadiumConfig(paramList) values: \n', values);

  const insert_stadium_config = `
  INSERT INTO PFB_STADIUM_CONFIG (
      stadium_id,
      match_type,
      allow_gender,
      level_criterion,
      match_start_time,
      match_end_time
    ) VALUES ${values}
`;

  try {
    return db.execute(insert_stadium_config).then(result => result[0].affectedRows);
  } catch (error) {
    console.log('----------insertStadiumConfig(data) error----------\n\n\n',error);
    return null;
  }
}

export async function updateStadium(data){
  console.log('data / updateStadium(data) 인자값: \n', data);
  try {
    const result = await db.execute(update_stadium, [
      data.status_code,
      data.photo_path,
      data.stadium_name,
      data.full_address,
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
      data.stadium_id  // 이 부분은 업데이트할 레코드를 식별하는 데 사용됩니다.
    ]);

    return result[0].affectedRows;
  } catch (error) {
    console.error('----------updateStadium(data) error----------\n\n\n', error);
    return null;
  }
}

export async function updateStadiumWithoutPhoto(data){
  try {
    const result = await db.execute(update_stadium_without_photo, [
      data.status_code,
      data.stadium_name,
      data.full_address,
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
      data.stadium_id  // 이 부분은 업데이트할 레코드를 식별하는 데 사용됩니다.
    ]);

    return result[0].affectedRows;
  } catch (error) {
    console.error('----------updateStadium(data) error----------\n\n\n', error);
    return null;
  }
}

export async function updateStadiumConfig(param){
  console.log('data / updateStadiumConfig(param) 인자값: \n', param);

  const query = `
    UPDATE PFB_STADIUM_CONFIG
    SET
      match_type = ?,
      allow_gender = ?,
      level_criterion = ?
    WHERE
      stadium_id = ?
    AND
      match_start_time = ?
  `;

  try {
    return db.execute(query, [param.match_type, param.allow_gender, param.level_criterion, param.stadium_id, param.match_start_time]).then(result => {
      console.log('config update query result: ', result);
      return result[0].affectedRows;
    });
  } catch (error) {
    console.log('----------insertStadiumConfig(data) error----------\n\n\n',error);
    return null;
  }
}