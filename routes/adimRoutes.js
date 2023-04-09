const express = require("express");

const {
  findAllUsers,
  adminsignuppost,
  adminSignIn,
  adminSignInPost,
  blockOrUnblock,
  addCategory,
  categoryStatus,
  removeCategory,
} = require("../controllers/adminController/adminController");

const Admin = require("../models/adminSchema/adminSchema");
const Category = require("../models/adminSchema/categorySchema");

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
  res.render("ordersList", { admin: true, admindash: true });
});

// ----------------------products
// all product
adminRoute.get("/productlist", isAdminLoggedIn, async (req, res) => {
  const adminData = await Admin.find().lean();
  const [{ name }] = adminData;
  res.render("productlLst", { admin: true, admindash: true, name });
});


// ----------------------category
// all category
adminRoute.get("/category", isAdminLoggedIn, async (req, res) => {
  const findAllCategory = await Category.find().lean();
  res.render("category", {
    admin: true,
    admindash: true,
    category: findAllCategory,
  });
});

// add category
adminRoute.post("/addcategory", addCategory);

adminRoute.get("/categoryStatus/:id", categoryStatus);

// all profile
adminRoute.get("/adminprofile", isAdminLoggedIn, (req, res) => {
  res.render("profile", { name: "McGopan", admindash: true });
});

// ----------------------user status
// small functionalities
adminRoute.get("/userStatus/:id", blockOrUnblock);
// small functionalities
adminRoute.get("/userStatusremove/:id", removeCategory);

module.exports = adminRoute;
