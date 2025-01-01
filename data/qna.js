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