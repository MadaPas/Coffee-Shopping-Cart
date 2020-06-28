const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const rateLimit = require('express-rate-limit');

// Get user model
const User = require("../models/user");

/* rate limiter */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(limiter);

// set specific limiter for different routes
router.use('/register', limiter);
router.use('/login', limiter);


/*
 *  Get register
 */
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  });
});

/*
 * Post register
 */
router.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("name", "Name is required!").notEmpty();
  req.checkBody("email", "Please enter valid email id!").isEmail();
  req.checkBody("username", "Username is required!").notEmpty();
  req.checkBody("password", "Password is required!").notEmpty();
  req.checkBody("password2", "Passwords do not match!").equals(password);

  const errors = req.validationErrors();

  if (errors) {
    res.render("register", {
      errors,
      user: null,
      title: "Register"
    });
  } else {
    await User.findOne({ username: username }, (err, user) => {
      if (err) console.log(err);
      if (user) {
        req.flash("danger", "Username exists, choose another!");
        res.redirect("/users/register");
      } else {
        const user = new User({
          name,
          email,
          username,
          password,
          admin: 0
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) console.log(err);
            user.password = hash;
            user.save(err => {
              if (err) console.log(err);
              else {
                req.flash("success", "You are now registered!");
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

/*
 *  Get login
 */
router.get("/login", (req, res) => {
  if (res.locals.user) res.redirect("/");
  res.render("login", {
    title: "Login"
  });
});

/*
 *  Post login
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

/*
 *  Get logout
 */
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logout successfully!");
  res.redirect("/users/login");
});

// Exports
module.exports = router;
