import express from "express";
import { config } from "../config.js";
import * as stadiumRepository from "../data/stadium.js";

/* 구장 리스트 페이지 */
export async function stadiumList(req, res, next) {
  const data_object = {
    page_title:"구장",
    sub_title:'구장 목록',
    regist_url:"/stadium/regist",
    main_region:config.region.main_region_code,
    sub_region:"",
    tabulator_config:[
      {title:'id', field:'id', visible:false},
      {title:'지역', field:'main_region'},
      {title:'구장이름', field:'stadium_name'},
      {title:'휴대폰', field:"contact_phone"},
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
  }

  res.render("stadium_detail", data_object);
}

/* 구장 등록 로직 */
export async function create(req, res, next) {
  const formData = req.body;
  const awsUploadPath = req.awsUploadPath;

  formData["photo_path"] = awsUploadPath;
  const insertResult = await stadiumRepository.insertStadium(formData);

  // 정상 등록
  if(insertResult) res.json({status:true, url:'/stadium'})

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
  }

  // 구장 정보 조회
  const stadium_id = parseInt(req.params.id, 10);
  const stadium_data = await stadiumRepository.getStadiumOneById(stadium_id);
  if(!stadium_data) res.render('error', {error:'잘못된 접근입니다.'});
  else data_object.data = stadium_data;

  // 기타 리소스
  data_object.sub_title = '구장 수정';
  data_object.main_region = config.region.main_region_code;
  
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