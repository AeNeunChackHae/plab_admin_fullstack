import express from "express";
import { config } from "../config.js";
import * as qnaRepository from '../data/qna.js'

/* QnA 리스트 페이지 */
export async function qnaList(req, res, next) {
  const data_object = {
    page_title:"QnA",
    sub_title:'QnA 목록',
    regist_url:"/qna/regist",
    edit_url:"/qna/edit/",
    filter_column: "title",
    tabulator_config:[
        {title:'id', field:'id', visible:false},
        {title:'사용자명', field:'username'},
        {title:'문의 제목', field:'title'},
        {title:'내용', field:"content"},
        {title:'일시', field:"created_at"},
      ]
  }

  const objectList = await qnaRepository.getAllValidUser();
  if(objectList){
    data_object.objectList = objectList;
  } else {
    data_object.objectList = {};
  }
  
  res.render("list_page", data_object);
}




// /* 구장 등록 로직 */
// export async function create(req, res, next) {
//   const formData = req.body;
//   const awsUploadPath = req.awsUploadPath;

//   formData["photo_path"] = awsUploadPath;
//   const insertResultId = await stadiumRepository.insertStadium(formData);

//   // 정상 등록
//   if(insertResultId) {
//     let flag = false;
//     const config_keys = ['match_type_', 'allow_gender_', 'level_criterion_', 'match_start_time_'];
//     const config_data_arr = [];
//     while(true){
//       let num = 0;
//       const sql_param = { 'stadium_id':insertResultId }

//       // match_type_(num)이 formData에 존재하는지 확인
//       config_keys.forEach(item => {
//         let name_attribute = item+num // 'match_type_0' ... 'allow_gender_0' ... 

//         // 존재하는 경우
//         if(name_attribute in formData){
          
//           let columnName = item.slice(0, -1);
//           sql_param[columnName] = formData[name_attribute]  // sql_param에 'match_type : 1' 저장
        
//         // 없는 경우
//         }else{
//           flag = true;
//         }
//       })

//       // num번 매치 설정이 없던 경우 (종료)
//       if(flag) break;

//       // num번 매치 설정이 있던 경우 (다음 매치 설정도 확인)
//       else {
//         config_data_arr.push(sql_param);
//         console.log('config_data_arr: ', config_data_arr);
//         num += 1;
//       }
//     }

//     const insertAffectedRows = await stadiumRepository.insertStadiumConfig(config_data_arr);

//     if(insertAffectedRows > 0) res.json({status:true, url:'/stadium'});
//     else res.json({status:false, error:'----- config insert affectedRows is 0 -----'});
//   }
//   // INSERT 쿼리 중 에러 발생
//   else res.json({status:false})
// }