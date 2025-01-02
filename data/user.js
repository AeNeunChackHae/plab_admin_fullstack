import { db } from "../mysql.js";

const select_user_by_statuscode = `SELECT id, gender, username, DATE_FORMAT(birth_date, '%Y-%m-%d')  as birth_date, phone_number FROM PFB_USER WHERE status_code = ?`;

export async function getAllValidUser(){
    try{
        return db.execute(select_user_by_statuscode, [0]).then((result) => result[0]);
    }catch(err){
        console.log('data / user.js getAllValidUser() except\n\n\n', err)
    }
}

export async function getAllWithdrawValidUser(){
    try{
        return db.execute(select_user_by_statuscode, [1]).then((result) => result[0]);
    }catch(err){
        console.log('data / user.js getAllValidUser() except\n\n\n', err)
    }
}