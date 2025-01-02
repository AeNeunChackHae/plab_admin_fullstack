import { db } from "../mysql.js";

// 전체 매니저 조회
export async function getAllValidUser() {
  const sql = `
    SELECT PFB_MANAGER.id, PFB_MANAGER.manager_name, PFB_MANAGER.phone_number, PFB_MANAGER.email,
    DATE_FORMAT(PFB_MANAGER.created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM PFB_MANAGER as PFB_MANAGER
    WHERE status_code = ?
  `;
  try {
    const [result] = await db.execute(sql, [1]);
    return result;
  } catch(err) {
    console.error('data/manager.js getAllValidUser() error:', err);
  }
}

// 수정 대기 매니저 조회
export async function getselectValidUser() {
    const sql = `
      SELECT PFB_MANAGER.id, PFB_MANAGER.manager_name, PFB_MANAGER.phone_number, PFB_MANAGER.email,
      DATE_FORMAT(PFB_MANAGER.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM PFB_MANAGER as PFB_MANAGER
      WHERE status_code = ?
    `;
    try {
      const [result] = await db.execute(sql, [0]);
      return result;
    } catch(err) {
      console.error('data/manager.js getAllValidUser() error:', err);
    }
  }

// 매니저 단일 조회
export async function getQnaOneById(managerId) {
    const sql = `
      SELECT id, manager_name, phone_number, email, status_code
      FROM PFB_MANAGER
      WHERE id = ?
    `;
    try {
      const [result] = await db.execute(sql, [managerId]);
      return result[0] || null;  // 데이터가 없으면 null 반환
    } catch (err) {
      console.error('data/manager.js getQnaOneById() error:', err);
      throw err;  // 에러를 호출한 쪽으로 전달
    }
}

// 매니저 업데이트
export async function updateManager(formData) {
    console.log(" data / manager / updateManager(formData) : ", formData)
    const sql = `
      UPDATE PFB_MANAGER
      SET status_code = ?, manager_name = ?, phone_number = ?, email = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const params = [
      formData.status_code,
      formData.manager_name,
      formData.phone_number,
      formData.email,
      formData.manager_id
    ];
  
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
}
