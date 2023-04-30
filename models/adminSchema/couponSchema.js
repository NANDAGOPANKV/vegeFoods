const mongoose = require("mongoose");

const couponScheme = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    offer: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      require: true,
    },
    CouponStatus: {
      type: Boolean,
      default: true,
    },
    usedUsersList: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponScheme);
