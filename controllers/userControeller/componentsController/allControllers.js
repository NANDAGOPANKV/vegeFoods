// imports
const Product = require("../../../models/adminSchema/productsSchema");
const User = require("../../../models/userSchema/usersSchema");
const Cart = require("../../../models/adminSchema/addToCartSchema");
const wishList = require("../../../models/adminSchema/wishList");

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

    // check the product already exist in wishlist
    const userDataSession = req.session.userData;
    const userData = await User.findById(userDataSession._id);
    const userId = userData._id;
    const wishListData = await wishList.findOne({ user: userId }).lean();

    if (wishListData) {
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
    } else {
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
    }
  } catch (error) {
    res.send(error.message);
  }
};

// wish list
// get all wishlist products
const wishlist = async (req, res) => {
  try {
    if (req.session.userData) {
      const userDataSession = req.session.userData;
      const wishlistExists = await wishList.find().lean();
      if (wishlistExists?.length > 0) {
        const userData = await User.findById(userDataSession._id);
        const userId = userData._id;
        const wishListData = await wishList
          .findOne({ user: userId })
          .populate("product.productId")
          .lean();

        const products = wishListData.product;

        if (products?.length > 0) {
          res.render("wishlist", {
            user: true,
            userLogged: true,
            products,
            emptWishlist: false,
          });
        } else {
          res.render("wishlist", {
            user: true,
            userLogged: true,
            emptWishlist: true,
          });
        }
      } else {
        res.render("wishlist", {
          user: true,
          userLogged: true,
          emptWishlist: true,
        });
      }
    } else {
      res.json({ failed: "signup please" });
    }
  } catch (error) {
    res.redirect("/shop");
  }
};

// wishlist controller add to wishlist
const wishlistController = async (req, res) => {
  try {
    if (req.session.userData) {
      const userDataSession = req.session.userData;
      const productId = req.query.id;
      const userId = userDataSession._id;

      // get data from db
      const productData = await Product.findById(productId);
      const userWishlist = await wishList.findOne({ user: userId });

      if (userWishlist) {
        const productExist = userWishlist.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExist >= 0) {
          res.send("product already in wishlist");
        } else {
          // more product

          await wishList
            .findOneAndUpdate(
              { user: userId },
              {
                $push: {
                  product: {
                    productId: productData._id,
                    descritption: productData.description,
                    image: productData.image,
                    name: productData.name,
                    price: productData.price,
                  },
                },
              }
            )
            .then(() => {
              res.send("product added to wishlist");
            });
        }
      } else {
        const data = new wishList({
          user: userId,
          product: [
            {
              productId: productData._id,
              descritption: productData.description,
              image: productData.image,
              name: productData.name,
              price: productData.price,
            },
          ],
        });
        const dataSaved = await data.save().then(() => {
          res.redirect("/wishlist");
        });
      }
    } else {
      res.json({ failed: "signup please" });
    }
  } catch (error) {
    res.send(error.message);
  }

  // res.render("wishlist", { user: true, userLogged: true });
};

// remove item from wishlist
const removeitemwishlist = async (req, res) => {
  const pId = req.query.id;
  const userId = req.session.userData;
  const uId = userId._id;

  const removeItem = await wishList.findOneAndUpdate(
    {},
    { $pull: { product: { productId: pId } } },
    { new: true }
  );

  res.redirect("/wishlist");
};

// cart controller add to cart
const cartController = async (req, res) => {
  try {
    if (req.session.userData) {
      const userDataSession = req.session.userData;
      const productId = req.query.id;

      const userId = userDataSession._id;
      const userData = await User.findById(userId);
      const productData = await Product.findById(productId);
      const userCart = await Cart.findOne({ user: userId });

      //if user cart available
      if (userCart) {
        const productExistIndex = userCart.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExistIndex >= 0) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          )
            .then((value) => {
              // product added to the cart again
              res.json({ message: "product add again" });
            })
            .catch((err) => {
              res.send(err.message);
            });

          const findcart = await Cart.findOne({
            user: userId,
            "product.productId": productId,
          });
          const find = findcart.product.find((value) => {
            return value.productId == productId;
          });

          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $set: { "product.$.totalPrice": find.quantity * find.price } }
          ).then((value) => {
            console.log(value, "--out put--");
          });
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price,
                  totalPrice: productData.price,
                  discoutPrice: productData.discoutPrice,
                },
              },
            }
          );
          res.send("product added to the cart");
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
              totalPrice: productData.price,
              discoutPrice: productData.discoutPrice,
            },
          ],
        });

        await data.save();
        res.render("cart", {
          user: true,
        });
      }
    } else {
      res.json({ failed: "signup please" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// show all cart items
const cartAll = async (req, res) => {
  try {
    if (req.session.userData) {
      const userID = req.session.userData;
      const user = await User.findById(userID._id);
      const findCart = await Cart.findOne({ user: user._id })
        .populate("product.productId")
        .lean();
      // all products
      let products = findCart?.product;
      if (products?.length > 0) {
        const subPrice = findCart.product.reduce(
          (acc, curr) => (acc += curr.totalPrice),
          0
        );

        let uid = findCart?.user;

        products.map((d) => {
          return d.quantity;
        });
        

        const discount = 0;
        const deliveryCharge = 35;
        const grandTotal = subPrice + discount + deliveryCharge;
        res.render("cart", {
          user: true,
          ajax: true,
          userLogged: true,
          products,
          discount,
          deliveryCharge,
          grandTotal,
          subPrice,
          uid,
        });
      } else {
        res.render("wishlist", {
          user: true,
          userLogged: true,
          emptWishlist: true,
          cart: true,
        });
      }
    } else {
      res.send("im sorry no user data");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// remove item from cart
const removeItemFromCart = async (req, res) => {
  const pId = req.query.id;

  const userID = req.session.userData;
  const uId = userID._id;

  const removeItem = await Cart.findOneAndUpdate(
    {},
    { $pull: { product: { productId: pId } } },
    { new: true }
  ).lean();

  res.redirect("/cart");
};

// decriment controller
const decrement = async (req, res) => {
  const pId = req.query.id;
  const uData = req.session.userData;
  const uId = uData?._id;
  try {
    const product = await Product.findOne({ _id: pId }).lean();

    let price = product?.price;
    let stock = product?.stock;

    const cart = await Cart.findOneAndUpdate(
      { user: uId, "product.productId": pId },
      { $inc: { "product.$.quantity": -1, "product.$.totalPrice": -price } },
      { new: true }
    );

    // update stock field
    const allProduct = await Product.findByIdAndUpdate(
      { _id: pId },
      { $set: { stock: stock + 1 } }
    );
    res.redirect("/cart");
  } catch (error) {
    res.send(error.message);
  }
};

// decriment controller
const increment = async (req, res) => {
  const pId = req.query.id;
  const uData = req.session.userData;
  const uId = uData?._id;
  try {
    const product = await Product.findOne({ _id: pId }).lean();

    let price = product?.price;
    let stock = product?.stock;

    const cart = await Cart.findOneAndUpdate(
      { user: uId, "product.productId": pId },
      { $inc: { "product.$.quantity": 1, "product.$.totalPrice": price } },
      { new: true }
    );

    // update stock field
    const allProduct = await Product.findByIdAndUpdate(
      { _id: pId },
      { $set: { stock: stock - 1 } }
    );

    res.redirect("/cart");
  } catch (error) {
    res.send(error.message);
  }
};

// checkout controller
const checkoutController = (req, res) => {
  res.render("checkout", { user: true, userLogged: true });
};

// profile controller
const profileController = async (req, res) => {
  const user = req.session.userData;
  const uId = user._id;
  // get the user
  const userData = await User.findById(uId);
  const { name, email, phone } = userData;
  res.render("profile", { user: true, userLogged: true, name, email, phone });
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
  cartAll,
  removeItemFromCart,
  wishlist,
  removeitemwishlist,
  decrement,
  increment,
};
