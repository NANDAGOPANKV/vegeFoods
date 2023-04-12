// modules
const bcript = require("bcrypt");

// schema's
const User = require("../../models/userSchema/usersSchema");
const Admin = require("../../models/adminSchema/adminSchema");
const Category = require("../../models/adminSchema/categorySchema");

// find all users
const findAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().lean();

    const [{ bolckUser }] = allUsers;

    res.render("allUsers", {
      admin: true,
      admindash: true,
      users: allUsers,
      bolckUser,
    });
  } catch (error) {
    res.send(error.message);
  }
};

// sign up for admin
const adminsignuppost = async (req, res) => {
  try {
    const hashPassword = await bcript.hash(req.body.password, 10);
    const AdminData = new Admin({
      name: req.body.username,
      email: req.body.email,
      password: hashPassword,
    });
    const adminAdded = await AdminData.save();
    res.render("signin", { admindash: true });
  } catch (error) {
    res.send(error.message);
  }
};
// sign in for admin
const adminSignIn = (req, res) => {
  res.render("signIn", { admindash: true });
};
// sign in for post
const adminSignInPost = async (req, res) => {
  try {
    const findAdmin = await Admin.find({ email: req.body.email }).lean();
    if (findAdmin.length == 0) {
      res.render("signIn", { admindash: true, account: true });
    } else {
      const [{ password, _id }] = findAdmin;
      req.session.adminID = _id;
      const hashPasswordCompare = await bcript.compare(
        req.body.password,
        password
      );
      if (hashPasswordCompare) {
        res.redirect("/dashboard");
      } else {
        res.render("signIn", { admindash: true, error: true });
      }
    }
  } catch (error) {
    res.send(error.message);
  }
};

// block user
const blockOrUnblock = async (req, res) => {
  try {
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
  } catch (error) {
    res.send(error.message);
  }
};

// category
const addCategory = async (req, res) => {
  try {
    let cN = req.body.categoryName;
    const sameCategory = await Category.find({ categoryName: cN });
    if (sameCategory.length == 0) {
      const categoryAdding = new Category({
        categoryStatus: true,
        categoryName: cN,
      });
      const categorySaved = await categoryAdding.save();
      if (categorySaved) {
        res.redirect("/category");
      } else {
        res.send(
          "sorry cannot send data to the database inform at vegefoodskalpetta@gmail.com"
        );
      }
    } else {
      const findAllCategory = await Category.find().lean();
      res.render("category", {
        exists: true,
        admin: true,
        admindash: true,
        category: findAllCategory,
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// category status

const categoryStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const findCategoryById = await Category.findById(categoryId);
    const { categoryName, categoryStatus } = findCategoryById;
    const listOrUnlistCategory = await Category.findByIdAndUpdate(categoryId, {
      categoryName,
      categoryStatus: !categoryStatus,
    });
    if (listOrUnlistCategory) {
      res.redirect("/category");
    }
  } catch (error) {
    res.send(error.message);
  }
};

const removeCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const removeCategory = await Category.findByIdAndRemove(categoryId);
    res.redirect("/category");
  } catch (error) {
    res.send(error.message);
  }
};

// sign up admin controller
const signUpController = (req, res) => {
  res.render("signUp", { admin: true, admindash: true });
};

// signout controller
const signOutController = (req, res) => {
  req.session.destroy();
  res.redirect("/adminsignin");
};

// dashboars
const dashBoard = (req, res) => {
  res.render("home", { admindash: true });
};

// order list
const orderList = (req, res) => {
  res.render("ordersList", { admin: true, admindash: true });
};

// add product controller
const addProductController = async (req, res) => {
  try {
    const name = nameOfAdmin();
    const categorysName = await Category.find().lean();
    res.render("addProducts", {
      admin: true,
      admindash: true,
      name,
      categorysName,
    });
  } catch (error) {
    res.send(error.message);
  }
};

// single product view controller
const singleProductView = (req, res) => {
  const name = "ds";
  res.render("addProducts", { admin: true, admindash: true, name });
};

// all profile controller
const allProfilesController = (req, res) => {
  res.render("profile", { name: "McGopan", admindash: true });
};

module.exports = {
  allProfilesController,
  singleProductView,
  addProductController,
  orderList,
  dashBoard,
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
};
