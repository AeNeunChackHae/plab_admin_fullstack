import { db } from "../mysql.js";

const d = `
  SELECT FAQ.id, USER.username, FAQ.title, FAQ.content,
  DATE_FORMAT(FAQ.created_at, '%Y-%m-%d %H:%i:%s') as created_at
  FROM PFB_FAQ as FAQ
  INNER JOIN PFB_USER USER ON FAQ.user_id = USER.id
`;
console.log(d)

export async function getAllValidUser(){
    try{
        return db.execute(d).then((result) => result[0]);
    }catch(err){
        console.log('data / user.js getAllValidUser() except\n\n\n', err)
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
  return result[0];  // 하나만 반환
}

// QnA 업데이트
export async function updateQna(formData) {
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

  