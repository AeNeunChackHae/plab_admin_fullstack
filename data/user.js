import { db } from "../mysql.js";

// 전체 사용자 조회
export async function getAllValidUser(){
    const sql = 
    `SELECT PFB_USER.id, PFB_USER.gender, PFB_USER.username, PFB_USER.phone_number,
    DATE_FORMAT(PFB_USER.birth_date, '%Y-%m-%d') as birth_date
    FROM PFB_USER as PFB_USER
    WHERE status_code = ?`
    ;
    try {
        const [result] = await db.execute(sql, [0]);
        return result;
    } catch(err) {
        console.error('data/user.js getAllValidUser() error:', err);
    }
}

// 전체 탈퇴 사용자 조회
export async function getAllWithdrawValidUser(){
    const sql = 
    `SELECT PFB_USER.id, PFB_USER.gender, PFB_USER.username, PFB_USER.phone_number,
    DATE_FORMAT(PFB_USER.birth_date, '%Y-%m-%d') as birth_date
    FROM PFB_USER as PFB_USER
    WHERE status_code = ?`
    ;
    try {
        const [result] = await db.execute(sql, [1]);
        return result;
    } catch(err) {
        console.error('data/user.js getAllValidUser() error:', err);
    }
}

// 사용자 단일 조회
export async function getUserOneById(adminId) {
    const sql = 
      `SELECT id, phone_number, email, status_code, username, gender, level_code,
      DATE_FORMAT(PFB_USER.birth_date, '%Y-%m-%d') as birth_date
      FROM PFB_USER
      WHERE id = ?`
    ;
    try {
      const [result] = await db.execute(sql, [adminId]);
      return result[0] || null;  // 데이터가 없으면 null 반환
    } catch (err) {
      console.error('data/admin.js getUserOneById() error:', err);
      throw err;  // 에러를 호출한 쪽으로 전달
    }
}

// 사용자 업데이트
export async function updateUser(formData) {
    console.log(" data / user / updateUser(formData) : ", formData)
    const sql = 
      `UPDATE PFB_USER
      SET status_code = ?
      WHERE id = ?`
    ;
    const params = [
      formData.status_code,
      formData.user_id
    ];
  
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
}

// 사용자 등록 로직
export async function insertUser(data){
    try {
        const sql = 
        `INSERT INTO PFB_USER (phone_number, email, status_code, username, gender, level_code, birth_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
        ;
            return db.execute(sql, [
                data.phone_number,
                data.email,
                data.status_code,
                data.username,
                data.gender,
                data.level_code,
                data.birth_date,
            ]).then(result => result[0].insertId);
    } catch (error) {
        console.log('----------insertAdmin(data) error----------\n\n\n',error);
        return null;
    }
}