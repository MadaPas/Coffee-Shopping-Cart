/*
    Import modules
*/
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const fileUpload = require("express-fileupload");
const passport = require("passport");

const config_database = require("./config/database");
const config_secret = require("./config/config.json");


/*
    Connect to Database
*/
mongoose.connect(config_database.database, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("You are connected to MongoDB!");
});

/*
    Initialize the application
*/
var app = express();
/*
    Set global errors variable
*/
app.locals.errors = null;

/*
    Views engine setup 
*/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


/*
    Set static folder
*/
app.use(express.static("./public"));

/*
    Get models
*/
Category = require("./models/category");
Page = require("./models/page");

/*
    Get all categories to pass to header.js
*/
Category.find((err, categories) => {
  if (err) console.log(err);
  else {
    app.locals.categories = categories;
  }
});

/*
    Get all pages to pass to header.js
*/
Page.find({}).sort({sorting: 1}).exec((err, pages) => {
    if (err) console.log(err);
    else {
      app.locals.pages = pages;
    }
  });


/*
    Express fileUpload middleware
*/
app.use(fileUpload());

/* 
    Body Parser Middleware --> parse application/x-www-form-urlencoded
*/
app.use(bodyParser.urlencoded({
  extended: false
}));
/*
   Parse application/json
*/
app.use(bodyParser.json());

/* used as middleware, sits between the request and the response */
app.use(session({
  secret: config_secret.sessionSecret,
  resave: false,
  saveUninitialized: true,
}));


/* Express validator middleware */
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: (value, filename) => {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";

          case ".jpeg":
            return ".jpeg";

          case ".png":
            return ".png";

          case "":
            return ".jpg";

          default:
            return false;
        }
      }
    }
  })
);

/* Express messages middleware */
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* Passport config */
require("./config/passport")(passport);
/*  Passport middleware */
app.use(passport.initialize());
app.use(passport.session());


app.get("*", (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});


/* Set routes */
const products = require("./routes/products.js");
app.use("/products", products);

const cart = require("./routes/cart.js");
app.use("/cart", cart);

const users = require("./routes/users");
app.use("/users", users);

const pages = require("./routes/pages.js");
app.use("/", pages);

const adminPages = require("./routes/admin-area/adminPages.js");
app.use("/admin/pages", adminPages);

const adminCategories = require("./routes/admin-area/adminCategories");
app.use("/admin/categories", adminCategories);

const adminProducts = require("./routes/admin-area/adminProducts");
app.use("/admin/products", adminProducts);

/* Start the server */
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}.`));