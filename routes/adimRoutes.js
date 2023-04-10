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
adminRoute.get("/productlist", isAdminLoggedIn, async (req, res) => {
  const name = nameOfAdmin();

  const findAllProducts = await Product.find().lean();

  res.render("productlLst", {
    admin: true,
    admindash: true,
    name: name.name,
    findAllProducts,
  });
});

// product methods********

// add products
adminRoute.get("/addproduct", (req, res) => {
  const name = nameOfAdmin();

  res.render("addProducts", { admin: true, admindash: true, name });
});
// add products post
adminRoute.post("/addproduct", upload.array("image", 3), addProducts);

// list or unlist product
adminRoute.get("/productStatus/:id", listOrUnlistProduct);

// delete products
adminRoute.get("/deleteProduct/:id", async (req, res) => {
  const productId = req.params.id;

  const deleteProduct = await Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect("/productlist");
    })
    .catch(() => {
      res.send("sorry cannot delete image");
    });
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

// list or unlist category
adminRoute.get("/categoryStatus/:id", categoryStatus);

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
