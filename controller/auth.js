import express from "express";

export async function loginPage(req, res, next) {
  res.render("login");
}

export async function loginLogic(req, res, next) {
  const body = req.body
  console.log(body)
  res.status(200);
}
