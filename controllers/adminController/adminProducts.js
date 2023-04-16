const Product = require("../../models/adminSchema/productsSchema");
const Category = require("../../models/adminSchema/categorySchema");

// list or unlist product
const listOrUnlistProduct = async (req, res) => {
  const productID = req.params.id;
  const findProductById = await Product.findById(productID);

  const { name, price, description, stock, image, discoutPrice, Status } =
    findProductById;

  const updateProductById = await Product.findByIdAndUpdate(productID, {
    name,
    price,
    description,
    stock,
    image,
    discoutPrice,
    Status: !Status,
  })
    .then(() => {
      res.redirect("/productlist");
    })
    .catch(() => {
      res.send("Sorry cannot update");
    });
};

// add product
const addProducts = async (req, res) => {
  const img = req.files.map((file) => file.filename);

  const productObj = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    image: img,
    category: req.body.category,
    discoutPrice: req.body.discount,
  };

  const productAdded = new Product({
    name: productObj.name,
    price: productObj.price,
    description: productObj.description,
    stock: productObj.stock,
    image: productObj.image,
    discoutPrice: productObj.discoutPrice,
    Status: true,
    category: productObj.category,
  });

  const added = await productAdded.save();

  if (added) {
    res.redirect("/productlist");
  } else {
    res.send("cannot Send");
  }
};

// product edit or add new
const singleProduct = async (req, res) => {
  const productId = req.params.id;

  const findProduct = await Product.findById(productId).lean();

  res.render("singleProductView", { findProduct });
};

const updateProduct = (req, res) => {
  res.render("home", { admindash: true });
};

const updatePage = async (req, res) => {
  const updateitem = await Product.findById(req.session.productId);

  const { name, price, description, stock } = updateitem;

  res.render("updateProduct", {
    admin: true,
    admindash: true,
    name,
    price,
    description,
    stock,
  });
};

const productLists = async (req, res) => {
  const findAllProducts = await Product.find().lean();

  res.render("productlLst", {
    admin: true,
    admindash: true,
    findAllProducts,
  });
};

const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  const deleteProduct = await Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect("/productlist");
    })
    .catch(() => {
      res.send("sorry cannot delete image");
    });
};

const allCategory = async (req, res) => {
  const findAllCategory = await Category.find().lean();
  res.render("category", {
    admin: true,
    admindash: true,
    category: findAllCategory,
  });
};

// show updated item
const updateItem = async (req, res) => {
  const id = req.query.id;

  const findOne = await Product.findById(id);

  // categorye here
  const categoryObj = await Category.find().lean();

  const {
    name,
    price,
    description,
    stock,
    _id,
    category,
    image,
    discoutPrice,
  } = findOne;
  const [img1, img2, img3] = image;

  res.render("updateProduct", {
    admin: true,
    admindash: true,
    name,
    price,
    description,
    stock,
    _id,
    categoryObj,
    category,
    discoutPrice,
    img1,
    img2,
    img3,
  });
};

// submit updated item
const updateItemPost = async (req, res) => {
  const productId = req.query.id;

  const updatedField = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    category: req.body.category,
    discount: req.body.discount,
  };

  const updateProductById = await Product.findByIdAndUpdate(productId, {
    name: updatedField.name,
    price: updatedField.price,
    category: updatedField.category,
    stock: updatedField.stock,
    description: updatedField.description,
    discoutPrice: updatedField.discount,
  })
    .then(() => {
      res.redirect("/productlist");
    })
    .catch((err) => {
      res.send(err.message);
    });
};

// view single product
const viewSinglePage = async (req, res) => {
  const id = req.query.id;

  const findOne = await Product.findById(id);

  // categorye here
  const categoryObj = await Category.find().lean();

  const {
    name,
    price,
    description,
    stock,
    _id,
    category,
    image,
    Status,
    discoutPrice,
  } = findOne;
  const [img1, img2, img3] = image;

  if (discoutPrice > 0) {
    dscp = true;
  } else {
    dscp = false;
  }

  res.render("spv", {
    admin: true,
    admindash: true,
    name,
    price,
    description,
    stock,
    _id,
    categoryObj,
    category,
    img1,
    img2,
    img3,
    Status,
    discoutPrice,
    dscp,
  });
};

// update Image
const chengeIMG = async (req, res) => {
  const productId = req.query.id;
  const img = req.files.map((file) => file.filename);
  const findOne = await Product.findById(productId);
  const { name, price, description, stock, category, image } = findOne;
  const updateProductById = await Product.findByIdAndUpdate(productId, {
    name,
    price,
    category,
    stock,
    description,
    image: img,
  })
    .then(() => {
      res.redirect("/productlist");
    })
    .catch((err) => {
      res.send(err.message);
    });
};

module.exports = {
  listOrUnlistProduct,
  addProducts,
  singleProduct,
  updateProduct,
  updatePage,
  productLists,
  deleteProduct,
  allCategory,
  updateItem,
  updateItemPost,
  viewSinglePage,
  chengeIMG,
};
