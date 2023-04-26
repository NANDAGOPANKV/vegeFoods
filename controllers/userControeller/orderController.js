const Order = require("../../models/adminSchema/orderSchema");
const Cart = require("../../models/adminSchema/addToCartSchema");
const Products = require("../../models/adminSchema/productsSchema");

const placeOrderController = async (req, res) => {
  const cartAmt = req.session.cartAmt;
  const uId = req.session.userData;
  const orderDetails = req.body;
  const cId = req.session.cartId;

  // get cart ids with uid
  const allCartItemsIds = await Cart.findOne({ user: uId })
    .select("product.productId")
    .lean();
  const allCartItems = await Cart.findOne({ user: uId }).lean();

  const cartAll = allCartItemsIds?.product?.map((data) => data);

  const ordersExisting = await Order.findOne({ user: uId });

  const ordersList = await Order.findOne({ user: uId });

  try {
    const detailsObj = {
      name: orderDetails?.name,
      email: orderDetails?.email,
      country: orderDetails?.country,
      state: orderDetails?.state,
      address: orderDetails?.address,
      city: orderDetails?.city,
      postalCode: orderDetails?.postalCode,
      phone: orderDetails?.phone,
      tandc: orderDetails?.tandc,
      total: cartAmt?.total,
      subtTotal: cartAmt?.subTotal,
      delCost: cartAmt?.delCost,
      orderMethod: orderDetails?.optradio,
    };

    if (detailsObj?.orderMethod === "COD") {
      let pMethod = "ordered";
      const ordersListing = new Order({
        user: uId,
        products: allCartItems?.product,
        totalAmount: detailsObj.total,
        delCost: detailsObj.delCost,
        address: {
          name: detailsObj.name,
          email: detailsObj.email,
          country: detailsObj.country,
          state: detailsObj.state,
          address: detailsObj.address,
          city: detailsObj.city,
          postalCode: detailsObj.postalCode,
          phone: detailsObj.phone,
          tandc: detailsObj.tandc,
        },
        paymentMethod: detailsObj.orderMethod,
        orderStatus: pMethod,
        date: Date.now(),
      });

      await ordersListing.save();
      res.redirect("/orderSuccess");
    } else {
      // online payment
      res.send("online");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving order details.");
  }
};

const successPage = (req, res) => {
  res.render("orderSuccess");
};

const myOrdersController = async (req, res) => {
  // show all possible order history
  const uId = req.session.userId;

  const allMyOrders = await Order.find({ user: uId }).lean();
  const allMyOrdersAddress = await Order.find({ user: uId }).select("address");
  const allMyOrdersProducts = await Order.find({ user: uId }).select(
    "products"
  );

  const allItems = allMyOrders.map((order) => {
    return order?.products?.map((product) => {
      return product?.productId;
    });
  });

  // all product ids in one array
  const allItemsIds = allItems.flat(Infinity);

  // finding all products
  const allPRoducts = await Products.find({ _id: { $in: allItemsIds } });
  console.log(allMyOrders);

  res.render("myOrders", {
    admindash: true,
    admin: true,
    name: "Nandagopan",
    allMyOrders,
  });
};

const cartDetailedItem = async (req, res) => {
  const oId = req.query.id;
  const uId = req.session.userId;

  let cartItem = await Cart.find({ user: uId }).select("product").lean();
  const orderItem = await Order.find({ _id: oId }).lean();
  console.log(orderItem);
  console.log("orderItem");
  cartItem = cartItem.map((data) => data?.product);
  console.log(cartItem);
  const [{ delCost, totalAmount, address, paymentMethod }] = orderItem;
  res.render("orderItemSingle", {
    user: true,
    orderItem,
    delCost,
    totalAmount,
    address,
    paymentMethod,
  });
};

module.exports = {
  placeOrderController,
  successPage,
  myOrdersController,
  cartDetailedItem,
};
