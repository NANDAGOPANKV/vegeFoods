const express = require("express");

// controllers import
const {
  userLogin,
  userSignUp,
  userOtp,
  userSignUpChecker,
  userSignIn,
  otpDataFunction,
  forgotPassword,
  forgotPasswordPost,
  fotpcheck,
  allProducts,
} = require("../controllers/userControeller/userControeller");
const Product = require("../models/adminSchema/productsSchema");

const userRouter = express();

// view engine setup
userRouter.set("view engine", "hbs");
userRouter.set("views", "./views/user");

// middlewars
const isUserLoggedIn = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};
// no entry after sign in
function noEntryAfterSignIn(req, res, next) {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    next();
  }
}

// home
userRouter.get("/", (req, res) => {
  if (req.session.userLoggedIn) {
    res.render("home", { user: true, userLogged: true });
  } else {
    res.render("home", { user: true });
  }
});

// about
userRouter.get("/about", (req, res) => {
  if (req.session.userLoggedIn) {
    res.render("about", { user: true, userLogged: true });
  } else {
    res.render("about", { user: true });
  }
});

// shop
userRouter.get("/shop", allProducts);

// single Product
userRouter.get("/product", isUserLoggedIn, async (req, res) => {
  const productId = req.query.id;
  const findProduct = await Product.findById(productId);
  const { name, price, image, stock, description } = findProduct;
  res.render("singleProduct", {
    user: true,
    userLogged: true,
    name,
    price,
    image,
    stock,
    description,
  });
});

// wishlist
userRouter.get("/wishlist", isUserLoggedIn, (req, res) => {
  res.render("wishlist", { user: true, userLogged: true });
});

// cart
userRouter.get("/cart", isUserLoggedIn, (req, res) => {
  res.render("cart", { user: true, userLogged: true });
});

// checkout
userRouter.get("/checkout", isUserLoggedIn, (req, res) => {
  res.render("checkout", { user: true, userLogged: true });
});

// profile
userRouter.get("/profile", isUserLoggedIn, (req, res) => {
  const data = req.session.userData;
  res.render("profile", { user: true, userLogged: true, data });
});

// contact
userRouter.get("/contact", isUserLoggedIn, (req, res) => {
  res.render("contact", { user: true, userLogged: true });
});

// otp
userRouter.get("/otp", noEntryAfterSignIn, userOtp);

// sign In
userRouter.get("/signin", noEntryAfterSignIn, userLogin);
userRouter.post("/signin", userSignIn);
userRouter.post("/otpData", otpDataFunction);

// sign Up
userRouter.get("/signup", noEntryAfterSignIn, (req, res) => {
  console.log(req.body);
  res.render("signUp", { auth: true });
});
// sign Up post
userRouter.post("/signup", userSignUpChecker);
// sign out
userRouter.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// forgot password
userRouter.get("/forgotpassword", forgotPassword);
userRouter.post("/forgotpassword", forgotPasswordPost);
userRouter.post("/fotpcheck", fotpcheck);

module.exports = userRouter;
