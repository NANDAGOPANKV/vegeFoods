// users Schema import
const User = require("../../models/userSchema/usersSchema");
//bcrypt
const bcript = require("bcrypt");

// node mailer
const { nMailer } = require("../userControeller/nodeMailer");
// otp generator
const { otpGen } = require("../../controllers/userControeller/otpController");

// product
const Product = require("../../models/adminSchema/productsSchema");
const Category = require("../../models/adminSchema/categorySchema");

// all controllers _________________________
// signup controller
const signUpController = (req, res) => {
  console.log(req.body);
  res.render("signUp", { auth: true });
};

// signout controller
const signOutController = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// user controller functions
const userLogin = (req, res) => {
  res.render("signIn", { auth: true });
};

// sign in
const userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email: email });
    if (findUser != null) {
      const { bolckUser } = findUser;

      if (findUser && bolckUser != true) {
        const hashPasswordComparison = await bcript.compare(
          password,
          findUser.password
        );
        if (hashPasswordComparison) {
          req.session.userLoggedIn = true;
          req.session.userData = findUser;
          req.session.userId = findUser._id;
          res.redirect("/");
        } else {
          res.render("signIn", { auth: true, incorectEOP: true });
        }
      } else {
        res.render("signUp", {
          emailWOU: email,
          auth: true,
          adminBlockedUser: bolckUser,
        });
      }
    } else {
      res.render("signIn", { auth: true, invUsr: true });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// otp verification and submitting the data into database
const otpDataFunction = async (req, res) => {
  try {
    const { value1, value2, value3, value4 } = req.body;
    const { name, email, phone, password } = req.session.userInfo;

    let otpNumber = Number(value1 + value2 + value3 + value4);

    const otpAuto = Number(req.session.OTP);

    // bcript
    const hashPassword = await bcript.hash(password, 10);

    const usersDB = new User({
      name,
      email,
      password: hashPassword,
      phone,
      bolckUser: false,
    });

    if (otpAuto === otpNumber) {
      await usersDB.save();
      res.redirect("/signin");
    } else {
      res.send("Incorrect OTP");
    }
  } catch (error) {
    res.send(error.message);
  }
};

// checking the user already exists or not then sending otp /Ufalse
const userSignUpChecker = async (req, res) => {
  let userObj;
  try {
    userObj = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };

    const findSameUsers = await User.findOne({ email: userObj.email });

    if (findSameUsers != null || findSameUsers != undefined) {
      const { name, password, phone } = userObj;
      res.render("signUp", {
        userExists: true,
        auth: true,
        name,
        password,
        phone,
      });
    } else {
      const { email, name, phone, password } = userObj;
      const otp = otpGen();
      req.session.userInfo = userObj;
      req.session.OTP = otp;
      nMailer(email, otp);

      res.render("otp", { otp: true, email });
    }
  } catch (error) {
    res.render(error.message);
  }
};

// moving to otp verification
const userOtp = (req, res) => {
  res.render("otp", { otp: true });
};

// forgot password
const forgotPassword = (req, res) => {
  res.render("forgotPassword", { auth: true });
};

let userId;
let password;
// forgot password post
const forgotPasswordPost = async (req, res) => {
  try {
    const { email } = req.body;
    password = req.body.password;

    const findUserAvailable = await User.findOne({ email: email });
    userId = findUserAvailable._id;

    if (findUserAvailable) {
      const otp = otpGen();
      nMailer(email, otp);
      res.render("otp", { otp: true, forgotP: true, email });
    } else {
      res.render("forgotPassword", {
        userNotExists: true,
        password,
        auth: true,
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// otp checker and updateor
const fotpcheck = async (req, res) => {
  // user id here

  try {
    const findOneUser = await User.findById(userId);

    const useDatas = {
      name: findOneUser?.name,
      email: findOneUser?.email,
      phone: findOneUser?.phone,
      address: findOneUser?.address,
      wishList: findOneUser?.wishList,
      createdAt: findOneUser?.createdAt,
      updatedAt: findOneUser?.updatedAt,
      password: findOneUser?.password,
      bolckUser: findOneUser?.bolckUser,
    };

    const newHashedPassword = await bcript.hash(password, 10);

    const updateUserPassword = await User.findByIdAndUpdate(userId, {
      name: useDatas.name,
      email: useDatas.email,
      phone: useDatas.phone,
      address: useDatas.address,
      wishList: useDatas.wishList,
      createdAt: useDatas.createdAt,
      updatedAt: useDatas.updatedAt,
      password: newHashedPassword,
      bolckUser: useDatas.bolckUser,
    });

    res.redirect("/signin");
  } catch (error) {
    res.send(error.message);
  }
};

// shop // products with category
const allProducts = async (req, res) => {
  const pageNo = req.query.page;
  const perPage = 4;
  
  try {
    const allCategory = await Category.find({
      categoryStatus: true,
    }).lean();

    const docCount = await Product.find({ Status: true });

    const allProductsOf = await Product.find({ Status: true })
      .skip((pageNo - 1) * perPage)
      .limit(perPage)
      .lean();

    if (req.session.userLoggedIn) {
      res.render("shop", {
        user: true,
        userLogged: true,
        allProductsOf,
        allCategory,
        pageNo,
        docCount: docCount?.length,
      });
    } else {
      res.render("shop", { user: true, allCategory, allProductsOf });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// find products by category
const findProductByCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;

    const productByCategory = await Category.findById(categoryId);
    const { categoryName, categoryStatus } = productByCategory;

    const allCategory = await Category.find({ categoryStatus: true }).lean();
    const findProductsByCategoryName = await Product.find({
      category: { $eq: categoryName },
      Status: true,
    }).lean();

    if (categoryStatus && findProductsByCategoryName != 0) {
      res.render("shop", {
        user: true,
        findProductsByCategoryName,
        products: true,
        allCategory,
      });
    } else {
      res.render("shop", {
        user: true,
        products: true,
        unlistedCategory: true,
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = {
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
};
