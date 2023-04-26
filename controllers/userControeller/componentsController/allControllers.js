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

    res.render("singleProduct", {
      ajax: true,
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
            ajax: true,
          });
        } else {
          res.render("wishlist", {
            user: true,
            userLogged: true,
            emptWishlist: true,
            ajax: true,
          });
        }
      } else {
        res.render("wishlist", {
          user: true,
          userLogged: true,
          emptWishlist: true,
          ajax: true,
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
      const productId = req.body.id;
      const userId = userDataSession._id;

      // get data from db
      const productData = await Product.findById(productId);
      const userWishlist = await wishList.findOne({ user: userId });

      if (userWishlist) {
        const productExist = userWishlist.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExist >= 0) {
          res.json({ pExists: "product already in wishlist" });
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
              res.json({ productOneTime: "product added to wishlist" });
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
  // Check if user is logged in
  if (!req.session.userData) {
    return res.status(401).send("Unauthorized");
  }

  // Get user ID from session
  const userId = req.session.userData._id;

  // Get product ID from query string
  const pId = req.body.id;

  // Find wishlist item for user and product
  const wishlistItem = await wishList.findOne({
    user: userId,
    "product.productId": pId,
  });
  // If wishlist item not found, return error
  if (!wishlistItem) {
    return res.status(404).send("Not found");
  }
  // Remove product from wishlist item
  const updatedWishlist = await wishList.findOneAndUpdate(
    { user: userId, "product.productId": pId },
    { $pull: { product: { productId: pId } } },
    { new: true }
  );
  // Redirect to wishlist page
  res.json({ message: "Item Removed From Wishlist" });
};

// cart controller add to cart
<<<<<<< HEAD
const cartController = async (req, res) => {
=======
const cartController = async (req, res) => {  
>>>>>>> b2
  try {
    if (req.session.userData) {
      const userDataSession = req.session.userData;
      const productId = req.body.id;
      const userId = userDataSession._id;
      const userData = await User.findById(userId);
      const productData = await Product.findById(productId);
      const userCart = await Cart.findOne({ user: userId });

      const cartData = await Cart.findOne({ user: userId })
        .populate("product.productId")
        .lean();

      if (cartData && cartData.product) {
        const findQuantity = cartData.product.find((value) => {
          return value.productId._id == productId;
        });

        //if user cart available
        if (userCart) {
          const productExistIndex = userCart.product.findIndex(
            (product) => product.productId == productId
          );

          if (productExistIndex >= 0) {
            if (
              productData.stock == findQuantity.quantity ||
              productData.stock < findQuantity.quantity
            ) {
              res.json({
                dsc: `Sorry We Only Have ${productData?.stock} Stock's`,
              });
            } else {
              await Cart.findOneAndUpdate(
                { user: userId, "product.productId": productId },
                { $inc: { "product.$.quantity": 1 } }
              );

              // product added to the cart again

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
                console.log("--out put--");
              });
              res.json({ dsc: "product added again" });
            }
          } else {
            await Cart.findOneAndUpdate(
              { user: userId },
              {
                $push: {
                  product: {
                    productId: productId,
<<<<<<< HEAD
=======
                    image: productData.image,
                    name: productData.name,
>>>>>>> b2
                    price: productData.price,
                    totalPrice: productData.price,
                    discoutPrice: productData.discoutPrice,
                  },
                },
              }
            );
            res.json({ pAA: "product succesfully added to the cart" });
          }
        } else {
          console.log("here");
          const data = new Cart({
            user: userId,
            product: [
              {
                productId: productId,
<<<<<<< HEAD
=======
                image: productData.image,
                name: productData.name,
>>>>>>> b2
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
        console.log("here");
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
<<<<<<< HEAD
=======
              image: productData.image,
              name: productData.name,
>>>>>>> b2
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
        // res.json({ failed: "Cart data not found" });
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
      // cart id
      const cId = await Cart.findOne({ user: user._id }).select("_id").lean();
      req.session.cartId = cId?._id;
      const findCart = await Cart.findOne({ user: user._id })
        .populate("product.productId")
        .lean();
<<<<<<< HEAD
      // all products
      let products = findCart?.product;
      let Stock = Product.find().lean();
=======
      const findCartItems = await Cart.findOne({ user: user._id });
      // all products
      let products = findCart?.product;
      let Stock = Product.find().lean();
      console.log(findCartItems);
>>>>>>> b2
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
          Stock,
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
    res.json({ message: error.message });
  }
};

// remove item from cart
const removeItemFromCart = async (req, res) => {
  const pId = req.body.id;
  console.log("yes", pId);
  const userID = req.session.userData;
  const uId = userID._id;

  const cartItem = await Cart.findOne({
    user: uId,
    "product.productId": pId,
  });

  if (!cartItem) {
    return res.status(404).send("Not Found");
  }

  const updateCart = await Cart.findOneAndUpdate(
    { user: uId, "product.productId": pId },
    { $pull: { product: { productId: pId } } },
    { new: true }
  );

  res.json({ message: "Item Removed From Cart" });
};

// decriment controller
const decrement = async (req, res) => {
  const pId = req.body.id;
  const uData = req.session.userData;
  const uId = uData?._id;
  try {
    const product = await Product.findOne({ _id: pId }).lean();
    const cartData = await Cart.findOne({ user: uId })
      .populate("product.productId")
      .lean();

    const findQuantity = cartData.product.find((value) => {
      console.log(value.productId._id);
      return value.productId._id == pId;
    });

    const allPrice = cartData.product.reduce((val, val2) => {
      return (val += val2.totalPrice);
    }, 0);

    const discount = 0;
    const deliveryCharge = 35;
    const grandTotal = allPrice + discount + deliveryCharge;

    let price = product?.price;
    let stock = product?.stock;
    if (findQuantity.quantity == 1) {
      console.log("WORKING THE PRODUCT IS 1");
      res.json({ findQuantity, allPrice, grandTotal });
    } else {
      const cart = await Cart.findOneAndUpdate(
        { user: uId, "product.productId": pId },
        { $inc: { "product.$.quantity": -1, "product.$.totalPrice": -price } },
        { new: true }
      );
      res.json({ findQuantity, stock, allPrice, grandTotal });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// decriment controller
const increment = async (req, res) => {
  const pId = req.body.id;
  const uData = req.session.userData;
  const uId = uData?._id;
  try {
    const product = await Product.findOne({ _id: pId }).lean();

    let price = product?.price;
    const cartData = await Cart.findOne({ user: uId })
      .populate("product.productId")
      .lean();

    const findQuantity = cartData.product.find((value) => {
      return value.productId._id == pId;
    });
    const Products = await Product.findOne({ _id: pId });

    const allPrice = cartData.product.reduce((val, val2) => {
      return (val += val2.totalPrice);
    }, 0);

    const discount = 0;
    const deliveryCharge = 35;
    const grandTotal = allPrice + discount + deliveryCharge;

    if (Products.stock == findQuantity.quantity) {
      res.json({ findQuantity, Products, allPrice, grandTotal });
    } else {
      const cart = await Cart.findOneAndUpdate(
        { user: uId, "product.productId": pId },
        { $inc: { "product.$.quantity": 1, "product.$.totalPrice": price } },
        { new: true }
      );

      // update stock field

      res.json({ findQuantity, Products, allPrice, grandTotal });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// checkout controller
const checkoutController = async (req, res) => {
  try {
    let cartAmt = req.session.cartAmt;
    const uId = req.session.userId;
    const uData = req.session.userData;
    const addressData = await User.findById(uId).select("address").lean();

    if (addressData?.address.length > 0) {
      const singleAddress = addressData?.address[0];

      const { name, phone, address, city, state, postalCode, country } =
        singleAddress;
      const { email } = uData;

      res.render("checkout", {
        user: true,
        userLogged: true,
        cartTot: cartAmt,
        name,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        email,
      });
    } else {
      res.send("create an address");
    }
  } catch (error) {
    res.send(error);
  }
};

// redirecting and saving cart info to the session
const checkoutControllerPost = (req, res) => {
  let val = req.body;
  req.session.cartAmt = val;
  res.redirect("/checkout");
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
  contactController,
  cartAll,
  removeItemFromCart,
  wishlist,
  removeitemwishlist,
  decrement,
  increment,
  checkoutControllerPost,
};
