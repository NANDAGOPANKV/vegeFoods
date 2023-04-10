const Product = require("../../models/adminSchema/productsSchema");

// list or unlist product
const listOrUnlistProduct = async (req, res) => {
  const productID = req.params.id;
  const findProductById = await Product.findById(productID);

  const { name, price, description, stock, image, discoutPrice, Status } =
    findProductById;

  const updateUserById = await Product.findByIdAndUpdate(productID, {
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

module.exports = { listOrUnlistProduct, addProducts };
