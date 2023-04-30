const Coupon = require("../../models/adminSchema/couponSchema");
const Cart = require("../../models/adminSchema/addToCartSchema");
const User = require("../../models/userSchema/usersSchema");

const checkCoupon = async (req, res) => {
  const { code, userId } = req.body;
  const user = req.session.userData;
  const userInfo = await User.findById(user._id);
  // cart id
  const cartData = await Cart.findOne({ user: userInfo._id }).lean();

  const getCartTotal = cartData?.product?.reduce((acc, curr) => {
    return acc + curr.totalPrice;
  }, 0);

  //   check coupon exists
  const possibleCoupon = await Coupon.findOne({ code: code });

  if (possibleCoupon == null) {
    const total = getCartTotal + 35;
    res.json({ error: "invalid coupon", cartTotal: total });
  } else {
    // amount cut down
    const afterOffer = getCartTotal + 35 - possibleCoupon?.offer;
    res.json({
      amount: possibleCoupon?.offer,
      payable: afterOffer,
      cartTotal: getCartTotal,
      success: true,
    });
  }
};

module.exports = { checkCoupon };
