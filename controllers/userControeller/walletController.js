const User = require("../../models/userSchema/usersSchema");

// wallet controller
const walletController = async (req, res) => {
  const uId = req.session.userId;
  const { name, wallet } = await User.findOne({ _id: uId }).lean();

  res.render("wallet", {
    user: true,
    userLogged: true,
    uId,
    wallet,
    name,
  });
};

// add money to wallet
const addMoney = async (req, res) => {
  let { amount, userId } = req.body;
  amount = Number(amount);

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { wallet: amount } },
    { new: true }
  );
  //   console.log(user);
  res.json({ message: "success", req: "/wallet" });
};

module.exports = { walletController, addMoney };
