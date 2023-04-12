// middlewars
const isUserLoggedIn = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};
module.exports = { isUserLoggedIn };
