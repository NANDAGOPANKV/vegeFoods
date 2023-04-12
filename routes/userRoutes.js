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
  findProductByCategory,
  signUpController,
  signOutController,
} = require("../controllers/userControeller/userControeller");

// route controllers
const {
  homeController,
  aboutController,
  allProductsController,
  wishlistController,
  cartController,
  checkoutController,
  profileController,
  contactController,
} = require("../controllers/userControeller/componentsController/allControllers");

// middlewars
const { isUserLoggedIn } = require("../middlewares/isUserLogged");
const { noEntryAfterSignIn } = require("../middlewares/noEntryAfterSignIn");

const userRouter = express();

// view engine setup
userRouter.set("view engine", "hbs");
userRouter.set("views", "./views/user");

// home
userRouter.get("/", homeController);
// about
userRouter.get("/about", aboutController);
// shop
userRouter.get("/shop", allProducts);
// list of products by category
userRouter.get("/categoryProduct", isUserLoggedIn, findProductByCategory);
// single Product
userRouter.get("/product", isUserLoggedIn, allProductsController);
// wishlist
userRouter.get("/wishlist", isUserLoggedIn, wishlistController);
// cart
userRouter.get("/cart", isUserLoggedIn, cartController);
// checkout
userRouter.get("/checkout", isUserLoggedIn, checkoutController);
// profile
userRouter.get("/profile", isUserLoggedIn, profileController);
// contact
userRouter.get("/contact", isUserLoggedIn, contactController);
// otp
userRouter.get("/otp", noEntryAfterSignIn, userOtp);
// sign In
userRouter.get("/signin", noEntryAfterSignIn, userLogin);
userRouter.post("/signin", userSignIn);
userRouter.post("/otpData", otpDataFunction);
// sign Up
userRouter.get("/signup", noEntryAfterSignIn, signUpController);
// sign Up post
userRouter.post("/signup", userSignUpChecker);
// sign out
userRouter.get("/signout", signOutController);
// forgot password
userRouter.get("/forgotpassword", forgotPassword);
userRouter.post("/forgotpassword", forgotPasswordPost);
userRouter.post("/fotpcheck", fotpcheck);

module.exports = userRouter;
