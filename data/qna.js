import { db } from "../mysql.js";

// 답변완료 QnA 조회
export async function getCompleteValidUser() {
  const sql = `
    SELECT FAQ.id, USER.username, FAQ.title, FAQ.content,
    DATE_FORMAT(FAQ.created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM PFB_FAQ as FAQ
    INNER JOIN PFB_USER USER ON FAQ.user_id = USER.id
    WHERE answer is NOT NULL
  `;
  try {
    const [result] = await db.execute(sql);
    return result;
  } catch(err) {
    console.error('data/qna.js getAllValidUser() error:', err);
  }
}

// 미답변 QnA 조회
export async function getWaitValidUser() {
  const sql = `
    SELECT FAQ.id, USER.username, FAQ.title, FAQ.content,
    DATE_FORMAT(FAQ.created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM PFB_FAQ as FAQ
    INNER JOIN PFB_USER USER ON FAQ.user_id = USER.id
    WHERE answer is NULL
  `;
  try {
    const [result] = await db.execute(sql);
    return result;
  } catch(err) {
    console.error('data/qna.js getAllValidUser() error:', err);
  }
}

// QnA 단일 조회
export async function getQnaOneById(qna_id) {
  const sql = `
    SELECT FAQ.id, USER.username, FAQ.title, FAQ.content, FAQ.answer
    FROM PFB_FAQ FAQ
    JOIN PFB_USER USER ON FAQ.user_id = USER.id
    WHERE FAQ.id = ?
  `;
  const [result] = await db.execute(sql, [qna_id]);
  return result[0];
}

// QnA 업데이트
export async function updateQna(formData) {
  console.log(" data / qna / updateQna(formData) : ", formData)
  const sql = `
    UPDATE PFB_FAQ
    SET answer = ?, updated_at = NOW()
    WHERE id = ?
  `;
  const params = [
    formData.answer,
    formData.qna_id
  ];

  const [result] = await db.execute(sql, params);
  return result.affectedRows > 0;
}