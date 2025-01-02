import { config } from "../config.js";
import * as stadiumRepository from '../data/stadium.js';
import * as managerRepository from '../data/manager.js';

export async function dashboard(req,res,next){
    const data_object = {
        basic_profile:config.profile.basic_profile_path,
        manager_apply_cnt:0,
        manager_approval_wait_arr:[],
        stadium_apply_cnt:0,
        stadium_approval_wait_arr:[],
    }

    

    // 매니저 승인 대기 리스트
    const select_wait_manager = await managerRepository.getselectValidUser();
    if(select_wait_manager){
        data_object.manager_approval_wait_arr = select_wait_manager;
        data_object.manager_apply_cnt = data_object.manager_approval_wait_arr.length;
    }

    // 구장 승인 대기 리스트
    const select_wait_stadium = await stadiumRepository.getAllWaitStadium();
    if(select_wait_stadium){
        data_object.stadium_approval_wait_arr = select_wait_stadium;
        data_object.stadium_apply_cnt = data_object.stadium_approval_wait_arr.length;
    }

    res.render("index",data_object);
}