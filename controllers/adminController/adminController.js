const User = require("../../models/userSchema/usersSchema");
const Admin = require("../../models/adminSchema/adminSchema");

// modules
const bcript = require("bcrypt");

// find all users
const findAllUsers = async (req, res) => {
  const allUsers = await User.find().lean();

  const [{ bolckUser }] = allUsers;

  console.log(bolckUser);

  res.render("allUsers", {
    admin: true,
    admindash: true,
    users: allUsers,
    bolckUser,
  });
};

// sign up for admin
const adminsignuppost = async (req, res) => {
  const hashPassword = await bcript.hash(req.body.password, 10);

  const AdminData = new Admin({
    name: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });

  const adminAdded = await AdminData.save();

  res.render("signin", { admindash: true });
};

// sign in for admin
const adminSignIn = (req, res) => {
  res.render("signIn", { admindash: true });
};
// sign in for post
const adminSignInPost = async (req, res) => {
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
};

module.exports = {
  findAllUsers,
  adminsignuppost,
  adminSignIn,
  adminSignInPost,
};
