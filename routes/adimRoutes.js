const express = require("express");

const adminRoute = express();

adminRoute.set("view engine", "hbs");
adminRoute.set("views", "./views/admin");

// dashboard
adminRoute.get("/dashboard", (req, res) => {
  res.render("home", { admindash: true });
});

// signIn
adminRoute.get("/adminsignin", (req, res) => {
  res.render("signIn", { admindash: true });
});

// signIn
adminRoute.get("/adminsignup", (req, res) => {
  res.render("signUp", { admindash: true });
});

module.exports = adminRoute;
