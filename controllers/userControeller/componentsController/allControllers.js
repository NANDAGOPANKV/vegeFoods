// imports
const Product = require("../../../models/adminSchema/productsSchema");
const User = require("../../../models/userSchema/usersSchema");
const Cart = require("../../../models/adminSchema/addToCartSchema");

// home controller
const homeController = (req, res) => {
  if (req.session.userLoggedIn) {
    res.render("home", { user: true, userLogged: true });
  } else {
    res.render("home", { user: true });
  }
};

// about controller
const aboutController = (req, res) => {
  if (req.session.userLoggedIn) {
    res.render("about", { user: true, userLogged: true });
  } else {
    res.render("about", { user: true });
  }
};

// all products
const allProductsController = async (req, res) => {
  try {
    const productId = req.query.id;
    const findProduct = await Product.findById(productId);
    const { name, price, image, stock, description, cart, _id } = findProduct;
    res.render("singleProduct", {
      user: true,
      userLogged: true,
      name,
      price,
      image,
      stock,
      description,
      cart,
      _id,
    });
  } catch (error) {
    res.send(error.message);
  }
};

// wishlist
const wishlistController = (req, res) => {
  res.render("wishlist", { user: true, userLogged: true });
};

// cart controller add to cart
const cartController = async (req, res) => {
  try {
    if (req.session.userLoggedIn) {
      const productId = req.query.id;
      const userDataSession = req.session.userData;
      const userId = userDataSession._id;
      const userData = await User.findById(userDataSession._id);
      const productData = await Product.findById(productId);

      const userCart = await Cart.findOne({ user: userId });

      // user cart avail
      if (userCart) {
        const productExistIndex = userCart.product.findIndex(
          (product) => product.productId == productId
        );
        console.log(userCart);
        if (productExistIndex >= 0) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          ).then((value) => {
            res.json({ message: true });
          });
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: { productId: productId, price: productData.price },
              },
            }
          );
          res.render("cart", {
            user: true,
            userLogged: true,
          });
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });

        await data.save();
        res.render("cart", {
          user: true,
          userLogged: true,
        });
      }
    } else {
      res.json({ failed: "signup please" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// checkout controller
const checkoutController = (req, res) => {
  res.render("checkout", { user: true, userLogged: true });
};

// profile controller
const profileController = (req, res) => {
  const data = req.session.userData;
  res.render("profile", { user: true, userLogged: true, data });
};

// contact controller
const contactController = (req, res) => {
  res.render("contact", { user: true, userLogged: true });
};

module.exports = {
  homeController,
  aboutController,
  allProductsController,
  wishlistController,
  cartController,
  checkoutController,
  profileController,
  contactController,
};
