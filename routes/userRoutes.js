const express = require("express");

// controllers import
const {
  userLogin,
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
  contactController,
  cartAll,
  removeItemFromCart,
  wishlist,
  removeitemwishlist,
  decrement,
  increment,
  checkoutControllerPost,
} = require("../controllers/userControeller/componentsController/allControllers");

// middlewars
const { isUserLoggedIn } = require("../middlewares/isUserLogged");
const { noEntryAfterSignIn } = require("../middlewares/noEntryAfterSignIn");
const {
  editor,
  profileController,
} = require("../controllers/userControeller/profileController");
const {
  addressController,
  createAddressController,
  showAddressController,
} = require("../controllers/userControeller/addressController");

const {
  placeOrderController,
  successPage,
  myOrdersController,
  cartDetailedItem,
  returnOrder,
  orderCancel,
  verifyPayment,
} = require("../controllers/userControeller/orderController");
// coupon controller
const {
  checkCoupon,
} = require("../controllers/userControeller/couponController");

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
userRouter.get("/wishlist", isUserLoggedIn, wishlist);
userRouter.post("/addwishlist", isUserLoggedIn, wishlistController);
userRouter.post("/removeitemwishlist", isUserLoggedIn, removeitemwishlist);
// cart
// add to cart
userRouter.post("/cartp", isUserLoggedIn, cartController);
// show cart items
userRouter.get("/cart", isUserLoggedIn, cartAll);
// decrement
userRouter.patch("/pdecriment", decrement);
// increment
userRouter.patch("/pincrement", increment);
// remove one item from cart
userRouter.post("/removeitemcart", removeItemFromCart);
// -------------------------- coupon
// apply coupon
userRouter.post("/applyCoupon", checkCoupon);

// checkout -----------------take the value and order
userRouter.get("/checkout", isUserLoggedIn, checkoutController);
userRouter.post("/checkoutpost", checkoutControllerPost);
// payments and all the stuff's
userRouter.post("/orderSet", placeOrderController);
userRouter.post("/verifyPayment", verifyPayment);
// return order
userRouter.get("/returnItem", isUserLoggedIn, returnOrder);
// order success page
userRouter.get("/orderSuccess", isUserLoggedIn, successPage);
// order history/all orders
userRouter.get("/myorders", isUserLoggedIn, myOrdersController);
// single order details page
userRouter.get("/orderDetails", isUserLoggedIn, cartDetailedItem);
// cancel order
userRouter.get("/cancelOrder", isUserLoggedIn, orderCancel);
// profile
userRouter.get("/profile", isUserLoggedIn, profileController);
// edit profile
userRouter.post("/editProfile", editor);
// address
userRouter.get("/myaddress", isUserLoggedIn, showAddressController);
// address page create
userRouter.get("/createAddress", isUserLoggedIn, addressController);
userRouter.post("/address", createAddressController);
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
