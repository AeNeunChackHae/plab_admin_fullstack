import express from "express";
import { config } from "../config.js";
import * as stadiumRepository from "../data/stadium.js";

export async function registPage(req, res, next) {
  res.render("detail_page", { page_title: "구장", table_title: "구장 목록" });
}

export async function editPage(req, res, next) {
  res.render("detail_page", { page_title: "구장" });
}

export async function waitStadiumList(req, res, next) {
  res.render("list_page", {
    page_title: "구장",
    table_title: "구장 목록",
    regist_url: "/stadium/regist",
  });
}

export async function create(req, res, next) {
  const formData = req.body;
  console.log("formData : ", formData);
  res.redirect("/");
}
