const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const connector = process.env.DB_connection;

mongoose
  .connect(connector)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err.message);
  });
