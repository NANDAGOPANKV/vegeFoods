const crypto = require("crypto");

const Order = require("../../models/adminSchema/orderSchema");
const Cart = require("../../models/adminSchema/addToCartSchema");
const Products = require("../../models/adminSchema/productsSchema");
// rozar pay
const Rozarpay = require("razorpay");
const { log } = require("console");

let instance = new Rozarpay({
  key_id: "rzp_test_0y2DtbdwtwS8LD",
  key_secret: "wd0kZaATnRxQV6q9ljx5QrYq",
});

// order placing
const placeOrderController = async (req, res) => {
  const cartAmt = req.session.cartAmt;
  const uId = req.session.userData;
  const userId = req.session.userId;

  const orderDetailsObject = req.body;

  const orderDetails = Object.fromEntries(
    Object.entries(orderDetailsObject).map(([key, value]) => [
      key.replace(/^value\[(.*)\]$/, "$1"),
      value,
    ])
  );   

  const cId = req.session.cartId;

  // get cart ids with uid
  const allCartItemsIds = await Cart.findOne({ user: uId })
    .select("product.productId")
    .lean();
  const allCartItems = await Cart.findOne({ user: uId }).lean();

  const cartAll = allCartItemsIds?.product?.map((data) => data);
  const cartId = cartAll.map((d) => d?.productId?._id).toString();

  const ordersExisting = await Order.findOne({ user: uId });

  const ordersList = await Order.findOne({ user: uId }).select("_di").lean();

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

    let pMethod = "ordered";

    let productData = allCartItems?.product;
    const allData = { ...detailsObj, pMethod, productData };

    // making an copy inside session
    req.session.userOrderData = allData;

    if (detailsObj?.orderMethod === "COD") {
      let qty = allCartItems?.product.map((data) => data?.quantity);
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
      // saving order details in orders
      await ordersListing.save();
      // decrease stock from product
      const products = await Products.find();

      const cart = await Cart.findOne({ user: userId });
      cart.product.forEach(async (element) => {
        products.forEach(async (elem, index) => {
          if (element.productId == elem.id) {
            const productStock = products[index].stock;
            await Products.findOneAndUpdate(
              { _id: elem?._id },
              { $set: { stock: productStock - element.quantity } },
              { new: true }
            );
          }
        });
      });
      console.log("reached");
      await Cart.updateOne({ user: userId }, { $set: { product: [] } });
      res.json({ redirectUrl: "/orderSuccess" });
    } else {
      // online payment
      let qty = allCartItems?.product.map((data) => data?.quantity);
      req.session.paymentMethod = "online payment";
      const oid = ordersList?._id;
      const { v4: uuidv4 } = require("uuid");

      // generate a unique ID for the order
      const orderId = uuidv4();

      const options = {
        amount: detailsObj.total * 100,
        currency: "INR",
        receipt: orderId,
      };

      instance.orders.create(options, (err, order) => {
        if (err) {
          res.json({ error: err });
        } else {
          res.json({ RozarpayDetails: order });
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving order details.");
  }
};

// order success page
const successPage = (req, res) => {
  res.render("orderSuccess", { user: true, userLogged: true });
};

// taking all orders
const myOrdersController = async (req, res) => {
  // show all possible order history
  const uId = req.session.userId;

  const allMyOrders = await Order.find({ user: uId }).lean();

  // check status for return
  const checkStatus = allMyOrders?.map((data) => data?.orderStatus);

  // console.log(checkStatus);
  // Output: 'ordered'

  let yes;
  if (checkStatus == "delivered") {
    yes = true;
  } else {
    yes = false;
  }

  let d = "delivered";

  res.render("myOrders", {
    user: true,
    name: "Nandagopan",
    allMyOrders,
    yes,
    checkStatus,
    d,
  });
};

// card for order detaild page
const cartDetailedItem = async (req, res) => {
  const oId = req.query.id;
  const uId = req.session.userId;

  let cartItem = await Cart.find({ user: uId }).select("product").lean();
  const orderItem = await Order.find({ _id: oId }).lean();

  cartItem = cartItem.map((data) => data?.product);

  const [
    { delCost, totalAmount, address, paymentMethod, _id, orderStatus, date },
  ] = orderItem;
  // take a value

  let allMyOrdersProducts = await Order.find({ _id: oId }).select("products");
  allMyOrdersProducts = allMyOrdersProducts
    .map((data) => data?.products)
    .flat(Infinity);
  // let daate = new Date().toLocaleDateString();

  res.render("orderItemSingle", {
    user: true,
    orderItem,
    delCost,
    totalAmount,
    address,
    paymentMethod,
    _id,
    orderStatus,
    date,
    allMyOrdersProducts,
  });
};

// return order
const returnOrder = async (req, res) => {
  const oId = req.query.id;
  // item status changer
  const returned = "return request";
  // find item with order id and update status
  const orderItem = await Order.findOneAndUpdate(
    { _id: oId },
    { orderStatus: returned },
    { new: true }
  );

  res.redirect("/myorders");
};

// canel order
const orderCancel = async (req, res) => {
  const id = req.query.id;
  const status = "order canceled";
  const order = await Order.findOneAndUpdate(
    { _id: id },
    { orderStatus: status },
    { new: true }
  );

  res.redirect("/myorders");
};

// verify
const verifyPayment = async (req, res) => {
  console.log("here");
  const paymentDetails = req.body;
  console.log(paymentDetails);
  const uId = req.session.userData;
  const userId = req.session.userId;

  let hmac = crypto.createHmac("sha256", "wd0kZaATnRxQV6q9ljx5QrYq");
  hmac.update(
    paymentDetails["payment[razorpay_order_id]"] +
      "|" +
      paymentDetails["payment[razorpay_payment_id]"]
  );
  hmac = hmac.digest("hex");
  if (hmac == paymentDetails["payment[razorpay_signature]"]) {
    // change payment status
    const paymentMethod = req.session.paymentMethod;
    console.log("order data");
    const orderData = req.session.userOrderData;

    const detailsObj = {
      name: orderData?.name,
      email: orderData?.email,
      country: orderData?.country,
      state: orderData?.state,
      address: orderData?.address,
      city: orderData?.city,
      postalCode: orderData?.postalCode,
      phone: orderData?.phone,
      tandc: orderData?.tandc,
      total: orderData?.total,
      subtTotal: orderData?.subtTotal,
      delCost: orderData?.delCost,
      orderMethod: orderData?.orderMethod,
      paymentStatus: orderData?.pMethod,
      productData: orderData?.productData,
    };

    // order saving
    const ordersListing = new Order({
      user: uId,
      products: detailsObj?.productData,
      totalAmount: detailsObj.total,
      delCost: detailsObj.delCost,
      subtTotal: detailsObj.subtTotal,
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
      orderStatus: detailsObj.paymentStatus,
      date: Date.now(),
    });

    await ordersListing.save();

    const products = await Products.find();

    const cart = await Cart.findOne({ user: userId });
    cart.product.forEach(async (element) => {
      products.forEach(async (elem, index) => {
        if (element.productId == elem.id) {
          const productStock = products[index].stock;
          await Products.findOneAndUpdate(
            { _id: elem?._id },
            { $set: { stock: productStock - element.quantity } },
            { new: true }
          );
        }
      });
    });
    await Cart.updateOne({ user: userId }, { $set: { product: [] } });

    res.json({ redirectUrl: "/orderSuccess" });
  } else {
    res.json({ status: "Payment Failed" });
    console.log("payment Collapsed");
  }
};

module.exports = {
  returnOrder,
  placeOrderController,
  successPage,
  myOrdersController,
  cartDetailedItem,
  orderCancel,
  verifyPayment,
};
