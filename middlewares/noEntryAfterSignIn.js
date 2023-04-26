// no entry after sign in
function noEntryAfterSignIn(req, res, next) {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    next();
  }
}

module.exports = { noEntryAfterSignIn };
