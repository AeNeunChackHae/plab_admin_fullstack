import { db } from "../mysql.js";
import bcrypt from 'bcrypt'

// 전체 관리자 조회
export async function getAllValidUser() {
  const sql = 
      `SELECT PFB_ADMIN.id, PFB_ADMIN.admin_name, PFB_ADMIN.email,
      DATE_FORMAT(PFB_ADMIN.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM PFB_ADMIN as PFB_ADMIN
      WHERE del_yn = ?`
  ;
  try {
    const [result] = await db.execute(sql, ["N"]);
    return result;
  } catch(err) {
    console.error('data/admin.js getAllValidUser() error:', err);
  }
}

// 탈퇴 관리자 조회
export async function getselectValidUser() {
    const sql = 
      `SELECT PFB_ADMIN.id, PFB_ADMIN.admin_name, PFB_ADMIN.email,
      DATE_FORMAT(PFB_ADMIN.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM PFB_ADMIN as PFB_ADMIN
      WHERE del_yn = ?`
    ;
    try {
      const [result] = await db.execute(sql, ["Y"]);
      return result;
    } catch(err) {
      console.error('data/admin.js getAllValidUser() error:', err);
    }
  }

// 관리자 단일 조회
export async function getQnaOneById(adminId) {
    const sql = 
      `SELECT id, admin_name, login_password, email, del_yn
      FROM PFB_ADMIN
      WHERE id = ?`
    ;
    try {
      const [result] = await db.execute(sql, [adminId]);
      return result[0] || null;  // 데이터가 없으면 null 반환
    } catch (err) {
      console.error('data/admin.js getQnaOneById() error:', err);
      throw err;  // 에러를 호출한 쪽으로 전달
    }
}

// 관리자 업데이트
export async function updateAdmin(formData) {
    console.log(" data / admin / updateAdmin(formData) : ", formData)

    let hashedPassword = formData.login_password;

    if (formData.new_password && formData.new_password.trim() !== '') {
      hashedPassword = await bcrypt.hash(formData.new_password, 10);
    }

    const sql = 
      `UPDATE PFB_ADMIN
      SET del_yn = ?, admin_name = ?, login_password = ?, email = ?, updated_at = NOW()
      WHERE id = ?`
    ;
    const params = [
      formData.del_yn,
      formData.admin_name,
      hashedPassword,
      formData.email,
      formData.admin_id
    ];
  
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
}

// 관리자 등록 로직
export async function insertAdmin(data){
  try {
    const hashedPassword = await bcrypt.hash(data.login_password, 10);

    const sql = 
      `INSERT INTO PFB_ADMIN (del_yn, admin_name, email, login_password)
      VALUES (?, ?, ?, ?)`
    ;
      return db.execute(sql, [
        data.del_yn,
        data.admin_name,
        data.email,
        hashedPassword
      ]).then(result => result[0].insertId);
  } catch (error) {
    console.log('----------insertAdmin(data) error----------\n\n\n',error);
    return null;
  }
}