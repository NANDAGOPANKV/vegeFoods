const multer = require("multer");
const express = require("express");
// route base
const adminRoute = express();

const {
  findAllUsers,
  adminsignuppost,
  adminSignIn,
  adminSignInPost,
  blockOrUnblock,
  addCategory,
  categoryStatus,
  removeCategory,
  signUpController,
  signOutController,
  dashBoard,
  orderList,
  addProductController,
  singleProductView,
  allProfilesController,
} = require("../controllers/adminController/adminController");

const {
  addProducts,
  listOrUnlistProduct,
  productLists,
  deleteProduct,
  allCategory,
  updateItem,
  updateItemPost,
  viewSinglePage,
  chengeIMG,
} = require("../controllers/adminController/adminProducts");

// signin/auth controllers
const {
  isAdminLoggedIn,
  noEntryAfterSignIn,
} = require("../controllers/adminController/loginControllers/allControllers");
const { storeageFunc } = require("../middlewares/multer");

// multer
const upload = multer({ storage: storeageFunc });
// view engine setup
adminRoute.set("view engine", "hbs");
adminRoute.set("views", "./views/admin");

// routes ###############
// ----------------------authentication

// signIn
adminRoute.get("/adminsignin", noEntryAfterSignIn, adminSignIn);
// signIn post
adminRoute.post("/adminsigninpost", noEntryAfterSignIn, adminSignInPost);
// signUp
adminRoute.get("/adminsignup", signUpController);
// signUp post
adminRoute.post("/adminsignuppost", isAdminLoggedIn, adminsignuppost);
// sign out
adminRoute.get("/adminsignout", signOutController);
// ----------------------home

// dashboard
adminRoute.get("/dashboard", isAdminLoggedIn, dashBoard);
// ----------------------users

// all users
adminRoute.get("/userslist", isAdminLoggedIn, findAllUsers);
// ----------------------orders

// all orders
adminRoute.get("/orderlist", isAdminLoggedIn, orderList);
adminRoute.get("/aorderDetails", (req, res) => {
  res.send(req.query.id);
});
// ----------------------products Products

// all product
adminRoute.get("/productlist", isAdminLoggedIn, productLists);
// product methods********
// add products
adminRoute.get("/addproduct", isAdminLoggedIn, addProductController);
// add products post
adminRoute.post("/addproduct", upload.array("image", 3), addProducts);
// list or unlist product
adminRoute.get("/productStatus/:id", listOrUnlistProduct);
// single view admin
adminRoute.get("/productStatus/:id", singleProductView);
// delete products
adminRoute.get("/deleteProduct/:id", deleteProduct);
// update item
adminRoute.get("/updateitem", isAdminLoggedIn, updateItem);
// post
adminRoute.post("/updateitem", updateItemPost);
// image editor
adminRoute.post("/changeImage", upload.array("image", 3), chengeIMG);
// single products view
adminRoute.get("/viewsignproduct", isAdminLoggedIn, viewSinglePage);
// ----------------------category

// all category
adminRoute.get("/category", isAdminLoggedIn, allCategory);
// add category
adminRoute.post("/addcategory", addCategory);
// list or unlist category
adminRoute.get("/categoryStatus/:id", isAdminLoggedIn, categoryStatus);
// ----------------------category

// all profile
adminRoute.get("/adminprofile", isAdminLoggedIn, allProfilesController);
// ----------------------user status

// small functionalities
adminRoute.get("/userStatus/:id", blockOrUnblock);
// small functionalities
adminRoute.get("/userStatusremove/:id", removeCategory);

module.exports = adminRoute;
