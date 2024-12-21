import express from "express";
import { config } from "../config.js";
import * as stadiumRepository from "../data/stadium.js";

export async function registPage(req, res, next) {
  res.render("stadium_detail");
}

export async function editPage(req, res, next) {
  res.render("stadium_detail", { value: config.team.team_status_code });
}

export async function waitStadiumList(req, res, next) {
  res.render("list-datatable");
}

export async function create(req, res, next) {
  const formData = req.body;
  console.log("formData : ", formData);
  res.render("index");
}
