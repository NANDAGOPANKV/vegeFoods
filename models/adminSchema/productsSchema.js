const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  discoutPrice: {
    type: Number,
    required: false,
  },
  Status: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Product", productSchema);
