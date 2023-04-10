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

  // categorye here
  const categorysName = await Category.find().lean();

  

  const productObj = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    image: img,
  };

  const productAdded = new Product({
    name: productObj.name,
    price: productObj.price,
    description: productObj.description,
    stock: productObj.stock,
    image: productObj.image,
    discoutPrice: 0,
    Status: true,
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

const updateItem = async (req, res) => {
  const id = req.query.id;

  const findOne = await Product.findById(id);

  const { name, price, description, stock, _id } = findOne;

  res.render("updateProduct", {
    admin: true,
    admindash: true,
    name,
    price,
    description,
    stock,
    _id,
  });
};

const updateItemPost = (req, res) => {
  console.log("hikjhkljo");
  console.log(req.body);
  res.send(req.body);
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
};
