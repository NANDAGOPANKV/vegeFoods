// time module
const { getFullCurrentDate } = require("../../middlewares/time");
// coupon model
const Coupon = require("../../models/adminSchema/couponSchema");

// coupon page
const couponPage = async (req, res) => {
  const allCoupons = await Coupon.find().lean();

  if (allCoupons.length != 0) {
    // get all The datas from allCoupons
    res.render("coupon", { admin: true, admindash: true, allCoupons });
  } else {
    res.render("coupon", { admin: true, admindash: true, addCoupon: true });
  }
};

// create coupons
const addCouponController = async (req, res) => {
  const data = req.body;
  const time = getFullCurrentDate();

  const addCoupon = Coupon({
    code: data.couponcode,
    offer: data.couponamount,
    time,
  });
  await addCoupon.save();
  res.redirect("/coupon");
};

// list or unlist controller
const unlisOrUnlistController = async (req, res) => {
  const cId = req.query.id;
  const finCoupenById = await Coupon.findById(cId);
  const { code, offer, time, CouponStatus } = finCoupenById; 
  const item = await Coupon.findByIdAndUpdate(cId, {
    code,
    offer,
    time,
    CouponStatus: !CouponStatus,
  });
  res.redirect("/coupon")
};

// remove coupon
const removeController = async (req, res) => {
  const cId = req.query.id;
  await Coupon.findByIdAndRemove(cId);
  res.redirect("/coupon");
};

module.exports = {
  addCouponController,
  couponPage,
  unlisOrUnlistController,
  removeController,
};
