const User = require("../../models/userSchema/usersSchema");

// edit profile
const editor = async (req, res) => {
  const newUserData = req.body;
  const sessionUserData = req.session.userData;
  const uId = sessionUserData?._id;

  //   const changeUserInfo = await User.findByIdAndUpdate({uId, {});
  const user = await User.findByIdAndUpdate(uId, {
    name: newUserData.username,
    phone: newUserData.phone,
    dob: newUserData.birthday,
  });
  res.redirect("/profile");
};

// profile controller
const profileController = async (req, res) => {
  const user = req.session.userData;
  const uId = user._id;
  // get the user
  const userData = await User.findById(uId);
  const { name, email, phone, dob } = userData;
  res.render("profile", {
    user: true,
    userLogged: true,
    name,
    email,
    phone,
    dob,
  });
};

module.exports = { editor, profileController };
