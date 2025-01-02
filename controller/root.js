import { config } from "../config.js";

export async function dashboard(req,res,next){
    const data_object = {
        basic_profile:config.profile.basic_profile_path,
        manager_apply_cnt:0,
        manager_approval_wait_arr:[],
        stadium_apply_cnt:0,
        stadium_approval_wait_arr:[],
    }

    // 매니저 승인 대기 리스트
    
    data_object.manager_apply_cnt = data_object.manager_approval_wait_arr.length;

    // 구장 승인 대기 리스트
    
    data_object.stadium_apply_cnt = data_object.stadium_approval_wait_arr.length;

    res.render("index",data_object);
}