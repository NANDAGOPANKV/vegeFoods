const mongoose = require("mongoose");

const usersSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    dob: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      require: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      require: true,
    },
    bolckUser: {
      type: Boolean,
      required: false,
    },
    address: {
      type: Array,
      required: false,
    },
    wallet: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", usersSchema);
