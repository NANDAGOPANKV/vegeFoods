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

const {
  addProducts,
  listOrUnlistProduct,
  singleProduct,
  updateProduct,
  updatePage,
  productLists,
  deleteProduct,
  allCategory,
  updateItem,
  updateItemPost,
  viewSinglePage,
  chengeIMG,
} = require("../controllers/adminController/adminProducts");

const Admin = require("../models/adminSchema/adminSchema");
const Category = require("../models/adminSchema/categorySchema");
const Product = require("../models/adminSchema/productsSchema");

const multer = require("multer");
const path = require("path");

// multer to upload images
const storeage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImage"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storeage });

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

// admin name funtion
async function nameOfAdmin() {
  const adminData = await Admin.find().lean();
  const [{ name }] = adminData;
  return name;
}

// ----------------------authentication
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

// ----------------------home
// dashboard
adminRoute.get("/dashboard", isAdminLoggedIn, (req, res) => {
  res.render("home", { admindash: true });
});

// ----------------------users
// all users
adminRoute.get("/userslist", isAdminLoggedIn, findAllUsers);

// ----------------------orders
// all orders
adminRoute.get("/orderlist", isAdminLoggedIn, (req, res) => {
  res.render("ordersList", { admin: true, admindash: true });
});

// ----------------------products Products
// all product
adminRoute.get("/productlist", isAdminLoggedIn, productLists);

// product methods********

// add products
adminRoute.get("/addproduct", isAdminLoggedIn, async (req, res) => {
  const name = nameOfAdmin();
  const categorysName = await Category.find().lean();
  res.render("addProducts", {
    admin: true,
    admindash: true,
    name,
    categorysName,
  });
});
// add products post
adminRoute.post("/addproduct", upload.array("image", 3), addProducts);

// list or unlist product
adminRoute.get("/productStatus/:id", listOrUnlistProduct);

// single view admin
adminRoute.get("/productStatus/:id", (req, res) => {
  const name = "ds";
  res.render("addProducts", { admin: true, admindash: true, name });
});

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
adminRoute.get("/adminprofile", isAdminLoggedIn, (req, res) => {
  res.render("profile", { name: "McGopan", admindash: true });
});

// ----------------------user status
// small functionalities
adminRoute.get("/userStatus/:id", blockOrUnblock);
// small functionalities
adminRoute.get("/userStatusremove/:id", removeCategory);

module.exports = adminRoute;
