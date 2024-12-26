import express from "express";
import { config } from "../config.js";
import * as stadiumRepository from "../data/stadium.js";

const data_object = {
  page_title:"구장",
  sub_title:"",
  regist_url:"/stadium/regist"
}

export async function registPage(req, res, next) {
  // 동적 데이터 세팅
  data_object.sub_title = '구장 등록'

  res.render("stadium_detail", data_object);
}

export async function editPage(req, res, next) {
  // 동적 데이터 세팅
  data_object.sub_title = '구장 수정'
  data_object.mainObject = ''

  res.render("stadium_detail", data_object);
}

export async function stadiumList(req, res, next) {
  // 동적 데이터 세팅
  data_object.sub_title = '구장 목록'

  // 모든 운영중인 구장 Select
  const objectList = await stadiumRepository.getAllOperatingStadium()

  // 숫자코드 값 config에서 해당 값으로 변환  (0 -> 서울, 1 -> 부산)
  objectList.map(row => {
    row.지역 = config.region.region_main_category_code[row.지역]
    row.구장타입 = config.stadium_match.ground_type_code[row.구장타입]
  })
  data_object.objectList = objectList

  res.render("list_page", data_object);
}

export async function waitStadiumList(req, res, next) {
  // 동적 데이터 세팅
  data_object.sub_title = '제휴 요청 목록'

  res.render("list_page", data_object);
}

export async function create(req, res, next) {
  const formData = req.body;
  res.redirect("/");
}
