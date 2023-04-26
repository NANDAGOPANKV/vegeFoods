const User = require("../../models/userSchema/usersSchema");

// get address form
const addressController = (req, res) => {
  // render address creation page
  res.render("createAddress", { user: true });
};

// show address
const showAddressController = async (req, res) => {
  const uData = req.session.userData;
  // get user id from session
  const uId = uData._id;
  try {
    // retrive addres from user
    const uAddress = await User.findById(uId).lean();
    res.send(uAddress);

    if (uAddress?.address?.length == 0) {
      res.redirect("/createAddress");
    } else {
      const firstAddress = uAddress?.address[0];
      const { name, phone, address, city, state, postalCode, country } =
        firstAddress;

      res.render("address", {
        user: true,
        name,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
      });
    }
  } catch (error) {
    res.send(error);
  }
};

// create address
const createAddressController = async (req, res) => {
  try {
    const uData = req.session.userData;
    if (!uData) {
      return res.status(401).send("Unauthorized");
    }
    // get user id from session
    const uId = uData._id;
    // Extract address data from request body
    const { name, phone, address, city, state, postalCode, country } = req.body;
    // creating an address object
    const newAddress = {
      name,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
    };
    // update user doc with new address
    const updateUser = await User.findOneAndUpdate(
      { _id: uId },
      { $push: { address: newAddress } },
      { new: true }
    );
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  addressController,
  createAddressController,
  showAddressController,
};
