import express from "express";
import { config } from "../config.js";
import * as qnaRepository from '../data/qna.js';

/* QnA 리스트 페이지 */
export async function qnaList(req, res, next) {
  const data_object = {
    page_title:"QnA",
    sub_title:'QnA 목록',
    regist_url:"/qna/regist",
    edit_url:"/qna/edit/",
    regist_visible:false,
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

/* QnA 수정 페이지 */
export async function editPage(req, res, next) {
  const qna_id = parseInt(req.params.id, 10);
  const qna_data = await qnaRepository.getQnaOneById(qna_id);

  // QnA 데이터가 없을 경우
  if (!qna_data) {
    res.render('error', { error: '잘못된 접근입니다.' });
  } else {
    const data_object = {
      page_title: "QnA",
      sub_title: 'QnA 수정',
      data: qna_data
    };
    res.render("qna_detail", data_object);
  }
}

/* QnA 수정 로직 */
export async function update(req, res, next) {
  const formData = req.body;
  console.log(" controller / qna / update(formData) formData: ", formData);

  const updateResult = await qnaRepository.updateQna(formData);

  if (updateResult) {
    res.json({ status: true, url: '/qna' });
  } else {
    res.json({ status: false, error: 'update query exception 발생' });
  }
}
