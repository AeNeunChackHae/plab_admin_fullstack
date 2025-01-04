import express from "express";
import { config } from "../config.js";
import * as userRepository from '../data/user.js';

/* 사용자 리스트 페이지 */
export async function userList(req, res, next) {
  const data_object = {
    page_title:"사용자",
    sub_title:'사용자 목록',
    regist_url:"/user/regist",
    edit_url:"/user/edit/",
    level_type_code:config.mypage.level_type_code,
    regist_visible:true,
    filter_column: "title",
    tabulator_config:[
        {title:'id', field:'id', visible:false},
        {title:'성별', field:'gender'},
        {title:'이름', field:'username'},
        {title:'생년월일', field:"birth_date"},
        {title:'번호', field:'phone_number'}
      ]
  }

  const objectList = await userRepository.getAllValidUser();
  if(objectList){
    data_object.objectList = objectList;

    objectList.map(row => {
        row.gender = config.mypage.gender_type_code[row.gender]
    })
  }else{
    data_object.objectList = {}
  }
  res.render("list_page", data_object);
}

/* 탈퇴 유저 */
export async function withdrawUserList(req, res, next) {
  const data_object = {
    page_title:"사용자",
    sub_title:'탈퇴 유저 목록',
    regist_url:"/user/regist",
    edit_url:"/user/edit/",
    level_type_code:config.mypage.level_type_code,
    regist_visible:false,
    filter_column: "title",
    tabulator_config:[
        {title:'id', field:'id', visible:false},
        {title:'성별', field:'gender'},
        {title:'이름', field:'username'},
        {title:'생년월일', field:"birth_date"},
        {title:'번호', field:'phone_number'}
      ]
  }

  const objectList = await userRepository.getAllWithdrawValidUser();
  if(objectList){
    data_object.objectList = objectList;

    objectList.map(row => {
        row.gender = config.mypage.gender_type_code[row.gender]
    })
  }else{
    data_object.objectList = {}
  }
  res.render("list_page", data_object);
}

/* 사용자 등록 페이지 */
export async function registPage(req, res, next) {
    const data_object = {
        page_title:"사용자",
        sub_title:'사용자 등록',
        level_type_code:config.mypage.level_type_code,
        sub_region:"",
        data:{},  // '수정페이지'에 필요한 param인데 없으면 ejs에서 error 발생
    }

    res.render("user_detail", data_object);
}

/* 사용자 등록 로직 */
export async function create(req, res, next) {
  const formData = req.body;
  console.log(" controller / user / create(formData) formData: ", formData);

  const updateResult = await userRepository.insertUser(formData);

  if (updateResult) {
    res.json({ status: true, url: '/user' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}

/* 사용자 수정 페이지 */
export async function editPage(req, res, next) {
  const user_data_id = parseInt(req.params.id, 10);
  const user_data = await userRepository.getUserOneById(user_data_id);

  // 사용자 데이터가 없을 경우
  if (!user_data) {
    res.render('error', { error: '잘못된 접근입니다.' });
  } else {
    const data_object = {
      page_title: "사용자",
      sub_title: '사용자 수정',
      level_type_code:config.mypage.level_type_code,
      data: user_data
    };
    res.render("user_detail", data_object);
  }
}

/* 관리자 수정 로직 */
export async function update(req, res, next) {
  const formData = req.body;
  console.log(" controller / user / update(formData) formData: ", formData);

  const updateResult = await userRepository.updateUser(formData);

  if (updateResult) {
    res.json({ status: true, url: '/user' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}