const crypto = require("crypto");
// schema
const Order = require("../../models/adminSchema/orderSchema");
const Cart = require("../../models/adminSchema/addToCartSchema");
const Products = require("../../models/adminSchema/productsSchema");
const User = require("../../models/userSchema/usersSchema");

// time module
const { getFullCurrentDate } = require("../../middlewares/time");
// rozar pay
const Rozarpay = require("razorpay");

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

    if (orderDetails?.optradio == "COD") {
      const OrderCod = require("../../models/adminSchema/orderSchema");

      let amt;
      let checker;
      amt = detailsObj.total;
      checker = amt.includes("₹");
      if (checker == true) {
        amt = Number(detailsObj.total.slice(1));
        console.log(amt);
      } else {
        amt = Number(detailsObj.total);
        console.log(amt);
      }

      const data = new OrderCod({
        user: uId,
        products: allCartItems?.product,
        totalAmount: amt,
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
        date: getFullCurrentDate(),
      });

      // saving order details in orders
      await data.save();

      console.log("cod");
      // decrease stock from product
      const products = await Products.find();
      console.log("reached1");
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
      res.json({ orderSuccess: true });
    } else if (orderDetails?.optradio == "wallet") {
      console.log("wallet");
      // wallet
      const { wallet } = await User.findOne({ _id: userId });
      if (wallet > 0) {
        if (detailsObj?.total > wallet) {
          res.json({ bal: "Check Wallet Balance" });
        } else {
          // order placing
          // const amt = Number(detailsObj.total.slice(1));

          let amt;
          let checker;
          amt = detailsObj?.total;
          checker = amt.includes("₹");
          if (checker == true) {
            amt = Number(detailsObj.total.slice(1));
            console.log(amt);
          } else {
            amt = Number(detailsObj.total);
            console.log(amt);
          }

          let qty = allCartItems?.product.map((data) => data?.quantity);
          const ordersListing = new Order({
            user: uId,
            products: allCartItems?.product,
            totalAmount: amt,
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
            date: getFullCurrentDate(),
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
          // order placing

          // const wallet
          await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { wallet: -amt } },
            { new: true }
          );
          // removing cart decrease amount of money from wallet
          await Cart.updateOne({ user: userId }, { $set: { product: [] } });
          res.json({ redirectUrl: "/orderSuccess" });
        }
      } else {
        res.json({ error: "wallet empty" });
      }
    } else {
      console.log("online payment");
      // online payment
      let qty = allCartItems?.product.map((data) => data?.quantity);
      req.session.paymentMethod = "online payment";
      const oid = ordersList?._id;
      const { v4: uuidv4 } = require("uuid");

      let amt;
      let checker;
      amt = detailsObj.total;
      checker = amt.includes("₹");
      if (checker == true) {
        amt = Number(detailsObj.total.slice(1));
        console.log(amt);
      } else {
        amt = Number(detailsObj.total);
        console.log(amt);
      }

      const orderId = uuidv4();

      const options = {
        amount: amt * 100,
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
    console.log(error);
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

  const allMyOrders = await Order.find({ user: uId })
    .sort({ createdAt: -1 })
    .lean();

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

  console.log(allMyOrdersProducts);
  console.log(orderItem);

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
  const uId = req.session.userId;
  const status = "order canceled";

  try {
    const { paymentMethod, totalAmount, delCost, discount } =
      await Order.findById(id);

    const total = totalAmount + delCost + discount;

    // adding back the money to the wallet
    if (paymentMethod == "wallet") {
      await User.findOneAndUpdate(
        { _id: uId },
        {
          $inc: { wallet: total },
        },
        { new: true }
      );
    }

    const order = await Order.findOneAndUpdate(
      { _id: id },
      { orderStatus: status },
      { new: true }
    );

    res.redirect("/myorders");
  } catch (error) {
    res.json({ error });
  }
};

// verify
const verifyPayment = async (req, res) => {
  const paymentDetails = req.body;
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
    const orderData = req.session.userOrderData;

    const amt = Number(orderData?.total.slice(1));

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
      total: amt,
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
      date: getFullCurrentDate(),
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
