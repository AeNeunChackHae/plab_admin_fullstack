import express from "express";
import { config } from "../config.js";
import * as stadiumRepository from "../data/stadium.js";

/* 구장 리스트 페이지 */
export async function stadiumList(req, res, next) {
  const data_object = {
    page_title:"구장",
    sub_title:'구장 목록',
    regist_url:"/stadium/regist",
    edit_url:"/stadium/edit/",
    filter_column: "stadium_name",
    main_region:config.region.main_region_code,
    sub_region:"",
    tabulator_config:[
      {title:'id', field:'id', visible:false},
      {title:'지역', field:'main_region'},
      {title:'구장이름', field:'stadium_name'},
      {title:'구장타입', field:'ground_type'}
    ]
  }

  // 모든 운영중인 구장 Select
  const objectList = await stadiumRepository.getAllOperatingStadium()

  // 숫자코드 값 config에서 해당 값으로 변환  (0 -> 서울, 1 -> 부산)
  objectList.map(row => {
    row.main_region = config.region.main_region_code[row.main_region]
    row.ground_type = config.stadium_match.ground_type_code[row.ground_type]
  })
  data_object.objectList = objectList

  res.render("list_page", data_object);
}

/* 제휴 요청 목록 */
export async function waitStadiumList(req, res, next) {
  const data_object = {
    page_title:"구장",
    sub_title:'제휴 요청 목록',
    regist_url:"/stadium/regist",
    main_region:config.region.main_region_code,
    sub_region:"",
    tabulator_config:[
      {title:'id', field:'id', visible:false},
      {title:'지역', field:'main_region'},
      {title:'구장이름', field:'stadium_name'},
      {title:'휴대폰', field:"contact_phone"},
      {title:'구장타입', field:'ground_type'}
    ],
  }

  res.render("list_page", data_object);
}

/* 구장 등록 페이지 */
export async function registPage(req, res, next) {
  const data_object = {
    page_title:"구장",
    sub_title:'구장 등록',
    main_region:config.region.main_region_code,
    sub_region:"",
    data:{},  // '수정페이지'에 필요한 param인데 없으면 ejs에서 error 발생
    match_config_arr:[{time:'06:00'}, {time:'08:00'}, ],
    match_type_arr:config.stadium_match.match_type_code,
    match_gender_arr:config.stadium_match.match_gender_type_code,
    match_level_arr:config.stadium_match.match_level_limit_code,
  }

  res.render("stadium_detail", data_object);
}

/* 구장 등록 로직 */
export async function create(req, res, next) {
  const formData = req.body;
  const awsUploadPath = req.awsUploadPath;

  formData["photo_path"] = awsUploadPath;
  const insertResultId = await stadiumRepository.insertStadium(formData);

  // 정상 등록
  if(insertResultId) {
    let flag = false;
    const config_keys = ['match_type_', 'allow_gender_', 'level_criterion_', 'match_start_time_'];
    const config_data_arr = [];
    while(true){
      let num = 0;
      const sql_param = { 'stadium_id':insertResultId }

      // match_type_(num)이 formData에 존재하는지 확인
      config_keys.forEach(item => {
        let name_attribute = item+num // 'match_type_0' ... 'allow_gender_0' ... 

        // 존재하는 경우
        if(name_attribute in formData){
          
          let columnName = item.slice(0, -1);
          sql_param[columnName] = formData[name_attribute]  // sql_param에 'match_type : 1' 저장
        
        // 없는 경우
        }else{
          flag = true;
        }
      })

      // num번 매치 설정이 없던 경우 (종료)
      if(flag) break;

      // num번 매치 설정이 있던 경우 (다음 매치 설정도 확인)
      else {
        config_data_arr.push(sql_param);
        console.log('config_data_arr: ', config_data_arr);
        num += 1;
      }
    }

    const insertAffectedRows = await stadiumRepository.insertStadiumConfig(config_data_arr);

    if(insertAffectedRows > 0) res.json({status:true, url:'/stadium'});
    else res.json({status:false, error:'----- config insert affectedRows is 0 -----'});
  }
  // INSERT 쿼리 중 에러 발생
  else res.json({status:false})
}

/* 구장 수정 페이지 */
export async function editPage(req, res, next) {
  const data_object = {
    page_title:"구장",
    sub_title:'구장 수정',
    main_region:config.region.main_region_code,
    sub_region:"",
    data:{},
    match_config_arr:config.stadium_match.match_time_table,
    match_type_arr:config.stadium_match.match_type_code,
    match_gender_arr:config.stadium_match.match_gender_type_code,
    match_level_arr:config.stadium_match.match_level_limit_code,
  }

  // 구장 정보 조회
  const stadium_id = parseInt(req.params.id, 10);
  const stadium_data = await stadiumRepository.getStadiumOneById(stadium_id);
  if(!stadium_data) res.render('error', {error:'잘못된 접근입니다.'});
  else data_object.data = stadium_data;
  
  res.render("stadium_detail", data_object);
}

/* 구장 수정 로직 */
export async function update(req, res, next){
  const formData = req.body;
  formData["photo_path"] = req.awsUploadPath;
  console.log('controller / update(req,res,next) formData \n', formData);

  let updateResult;
  if(req.photo_except){
    updateResult = await stadiumRepository.updateStadiumWithoutPhoto(formData);
  }else{
    updateResult = await stadiumRepository.updateStadium(formData);
  }

  if(updateResult) res.json({status:true, url:'/stadium'});
  else res.json({status:false, error:'update query exception 발생'})
}

/* 메인 지역에 맞는 하위 지역 리스트 반환 */
export async function subRegion(req, res, next) {
  const main_region_idx = parseInt(req.params.id, 10);
  let data = "";
  switch(main_region_idx){
    case 0:
      data = config.region.region_seoul_code
      break;
    case 1:
      data = config.region.region_busan_code
      break;
    case 2:
      data = config.region.region_daegu_code
      break;
    case 3:
      data = config.region.region_incheon_code
      break;
    case 4:
      data = config.region.region_gwangju_code
      break;
    case 5:
      data = config.region.region_daejeon_code
      break;
    case 6:
      data = config.region.region_ulsan_code
      break;
    case 7:
      data = config.region.region_sejong_code
      break;
    case 8:
      data = config.region.region_gyeonggi_code
      break;
    case 9:
      data = config.region.region_gangwon_code
      break;
    case 10:
      data = config.region.region_chungbuk_code
      break;
    case 11:
      data = config.region.region_chungnam_code
      break;
    case 12:
      data = config.region.region_jeonbuk_code
      break;
    case 13:
      data = config.region.region_jeonnam_code
      break;
    case 14:
      data = config.region.region_gyeongbuk_code
      break;
    case 15:
      data = config.region.region_gyeongnam_code
      break;
    case 16:
      data = config.region.region_jeju_code
      break;
  }
  res.json({status:true, data})
}