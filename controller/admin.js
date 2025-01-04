import express from "express";
import { config } from "../config.js";
import * as adminRepository from '../data/admin.js';

/* 관리자 리스트 페이지 */
export async function adminList(req, res, next) {
  const data_object = {
    page_title:"관리자",
    sub_title:'관리자 목록',
    regist_url:"/admin/regist",
    edit_url:"/admin/edit/",
    regist_visible:true,
    filter_column: "admin_name",
    tabulator_config:[
        {title:'id', field:'id', visible:false},
        {title:'이름', field:'admin_name'},
        {title:'계정', field:'email'},
        {title:'일시', field:"created_at"},
      ]
  }

  const objectList = await adminRepository.getAllValidUser();
  if(objectList){
    data_object.objectList = objectList;
  } else {
    data_object.objectList = {};
  }
  
  res.render("list_page", data_object);
}

/* 탈퇴 관리자 리스트 페이지 */
export async function quitAdminList(req, res, next) {
    const data_object = {
        page_title:"관리자",
        sub_title:'관리자 목록',
        regist_url:"/admin/regist",
        edit_url:"/admin/edit/",
        regist_visible:false,
        filter_column: "admin_name",
        tabulator_config:[
            {title:'id', field:'id', visible:false},
            {title:'이름', field:'admin_name'},
            {title:'계정', field:'email'},
            {title:'일시', field:"created_at"},
          ]
      }
  
    const objectList = await adminRepository.getselectValidUser();
    if(objectList){
      data_object.objectList = objectList;
    } else {
      data_object.objectList = {};
    }
    
    res.render("list_page", data_object);
  }


/* 관리자 등록 페이지 */
export async function registPage(req, res, next) {
  const data_object = {
    page_title: "관리자",
    sub_title: '관리자 등록',
    data: {}
  };
    res.render("admin_detail", data_object);
}

/* 관리자 등록 로직 */
export async function create(req, res, next) {
  const formData = req.body;
  console.log(" controller / admin / create(formData) formData: ", formData);

  const updateResult = await adminRepository.insertAdmin(formData);

  if (updateResult) {
    res.json({ status: true, url: '/admin' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}

/* 관리자 수정 페이지 */
export async function editPage(req, res, next) {
  const admin_data_id = parseInt(req.params.id, 10);
  const admin_data = await adminRepository.getQnaOneById(admin_data_id);

  // 관리자 데이터가 없을 경우
  if (!admin_data) {
    res.render('error', { error: '잘못된 접근입니다.' });
  } else {
    const data_object = {
      page_title: "관리자",
      sub_title: '관리자 수정',
      data: admin_data
    };
    res.render("admin_detail", data_object);
  }
}

/* 관리자 수정 로직 */
export async function update(req, res, next) {
  const formData = req.body;
  console.log(" controller / admin / update(formData) formData: ", formData);

  const updateResult = await adminRepository.updateAdmin(formData);

  if (updateResult) {
    res.json({ status: true, url: '/admin' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}