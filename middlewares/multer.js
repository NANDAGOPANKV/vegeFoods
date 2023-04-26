const multer = require("multer");
const path = require("path");

// multer to upload images
const storeageFunc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImage"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

module.exports = { storeageFunc };
