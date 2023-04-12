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

module.exports = { isAdminLoggedIn, noEntryAfterSignIn, nameOfAdmin };
