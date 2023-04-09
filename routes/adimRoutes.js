const express = require("express");

const {
  findAllUsers,
  adminsignuppost,
  adminSignIn,
  adminSignInPost,
} = require("../controllers/adminController/adminController");

const users = require("../controllers/adminController/user");
const User = require("../models/userSchema/usersSchema");

const adminRoute = express();

adminRoute.set("view engine", "hbs");
adminRoute.set("views", "./views/admin");

// only entry after signin
function isAdminLoggedIn(req, res, next) {
  if (req.session.adminID) {
    next();
  } else {
    res.redirect("/adminsignin");
  }
}

// no entry after sign in
function noEntryAfterSignIn(req, res, next) {
  if (req.session.adminID) {
    res.redirect("/dashboard");
  } else {
    next();
  }
}

// dashboard
adminRoute.get("/dashboard", isAdminLoggedIn, (req, res) => {
  res.render("home", { admindash: true });
});

// signIn
adminRoute.get("/adminsignin", noEntryAfterSignIn, adminSignIn);
// signIn post
adminRoute.post("/adminsigninpost", noEntryAfterSignIn, adminSignInPost);

// signUp
adminRoute.get("/adminsignup", (req, res) => {
  res.render("signUp", { admin: true, admindash: true });
});

// signUp post
adminRoute.post("/adminsignuppost", isAdminLoggedIn, adminsignuppost);

// sign out
adminRoute.get("/adminsignout", (req, res) => {
  req.session.destroy();
  res.redirect("/adminsignin");
});

// all users
adminRoute.get("/userslist", isAdminLoggedIn, findAllUsers);

// all orders
adminRoute.get("/orderlist", isAdminLoggedIn, (req, res) => {
  res.render("ordersList", { admin: true, admindash: true, users });
});

// all product
adminRoute.get("/productlist", isAdminLoggedIn, (req, res) => {
  res.render("productlLst", { admin: true, admindash: true, users });
});

// all category
adminRoute.get("/category", isAdminLoggedIn, (req, res) => {
  res.render("category", { admin: true, admindash: true, users });
});

// all profile
adminRoute.get("/adminprofile", isAdminLoggedIn, (req, res) => {
  res.render("profile", { name: "McGopan", admindash: true });
});

// small functionalities
adminRoute.get("/userStatus/:id", async (req, res) => {
  const userId = req.params.id;

  const findUserById = await User.findById(userId);

  const {
    bolckUser,
    name,
    email,
    phone,
    password,
    address,
    wishList,
    createdAt,
    updatedAt,
  } = findUserById;

  const updateUserById = await User.findByIdAndUpdate(userId, {
    bolckUser: !bolckUser,
    name,
    email,
    phone,
    password,
    address,
    wishList,
    createdAt,
    updatedAt,
  })
    .then(() => {
      res.redirect("/userslist");
    })
    .catch(() => {
      res.send("can't do anything");
    });
});

module.exports = adminRoute;
