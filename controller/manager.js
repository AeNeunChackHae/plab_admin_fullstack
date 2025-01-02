import express from "express";
import { config } from "../config.js";
import * as managerRepository from '../data/manager.js';

/* 매니저 리스트 페이지 */
export async function managerList(req, res, next) {
  const data_object = {
    page_title:"매니저",
    sub_title:'매니저 목록',
    regist_url:"/manager/regist",
    edit_url:"/manager/edit/",
    regist_visible:false,
    filter_column: "manager_name",
    tabulator_config:[
        {title:'id', field:'id', visible:false},
        {title:'이름', field:'manager_name'},
        {title:'번호', field:'phone_number'},
        {title:'이메일', field:'email'},
        {title:'일시', field:"created_at"},
      ]
  }

  const objectList = await managerRepository.getAllValidUser();
  if(objectList){
    data_object.objectList = objectList;
  } else {
    data_object.objectList = {};
  }
  
  res.render("list_page", data_object);
}

/* 수정 대기 매니저 리스트 페이지 */
export async function waitManagerList(req, res, next) {
    const data_object = {
      page_title:"매니저",
      sub_title:'매니저 목록',
      regist_url:"/manager/regist",
      edit_url:"/manager/edit/",
      regist_visible:false,
      filter_column: "manager_name",
      tabulator_config:[
          {title:'id', field:'id', visible:false},
          {title:'이름', field:'manager_name'},
          {title:'번호', field:'phone_number'},
          {title:'이메일', field:'email'},
          {title:'일시', field:"created_at"},
        ]
    }
  
    const objectList = await managerRepository.getselectValidUser();
    if(objectList){
      data_object.objectList = objectList;
    } else {
      data_object.objectList = {};
    }
    
    res.render("list_page", data_object);
  }

/* 매니저 수정 페이지 */
export async function editPage(req, res, next) {
  const manager_data_id = parseInt(req.params.id, 10);
  const manager_data = await managerRepository.getQnaOneById(manager_data_id);

  // 매니저 데이터가 없을 경우
  if (!manager_data) {
    res.render('error', { error: '잘못된 접근입니다.' });
  } else {
    const data_object = {
      page_title: "매니저",
      sub_title: '매니저 수정',
      data: manager_data
    };
    res.render("manager_detail", data_object);
  }
}

/* 매니저 수정 로직 */
export async function update(req, res, next) {
  const formData = req.body;
  console.log(" controller / manager / update(formData) formData: ", formData);

  const updateResult = await managerRepository.updateManager(formData);

  if (updateResult) {
    res.json({ status: true, url: '/manager' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}