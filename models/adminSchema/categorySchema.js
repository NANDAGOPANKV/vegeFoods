const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryStatus: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Category", categorySchema);
