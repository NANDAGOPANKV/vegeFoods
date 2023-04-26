// modules imports
const express = require("express");
var path = require("path");
const hbs = require("express-handlebars");
const noCahse = require("nocache");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");

// data base import
const db = require("./db/connection");

// app
const app = express();

// dotENV
require("dotenv").config();

//------------- to connect public folder
app.use(express.static(path.join(__dirname + "/public")));
// cors
app.use(cors());

// view engine set up
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

// body parser to encode data from req
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// methods print on console
app.use((req, res, next) => {
  console.log(req.method + req.originalUrl);
  next();
});

// db connection
app.set(db);

// no cashe setup
app.use(noCahse());

// session setup
app.use(cookieParser());
app.use(
  session({
    secret: "imgopan",
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    resave: false,
  })
);

//--------------- for user routes
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

// -------------- for admin routes
const adminRoutes = require("./routes/adimRoutes");
app.use("/", adminRoutes);

// serve litem
app.listen(3000, () => {
  console.log("server running");
});
