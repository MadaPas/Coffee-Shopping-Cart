const express = require("express");
const router = express.Router();

// Get product model
var Product = require("../models/product");

/*
 *  Get add product to cart
 */
router.get("/add/:product", async (req, res) => {
  var slug = req.params.product;
  await Product.findOne({ slug: slug }, (err, product) => {
    if (err) console.log(err);
    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: "/productImages/" + product._id + "/" + product.image
      });
    } else {
      var cart = req.session.cart;
      var newItem = true;

      for (i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: "/productImages/" + product._id + "/" + product.image
        });
      }
    }
    req.flash("success", "Product added to the cart!");
    res.redirect("back");
  });
});

/*
 *  Get checkout page
 */
router.get("/checkout", (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect("/cart/checkout");
  } else {
    res.render("checkout", {
      title: "Checkout",
      cart: req.session.cart
    });
  }
});

/*
 *  Get update product
 */
router.get("/update/:product", (req, res) => {
  var slug = req.params.product;
  var cart = req.session.cart;
  var action = req.query.action;
  console.log("action: ", action);
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          console.log("Enter add switch");
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log("Update Problem");
          break;
      }
      break;
    }
  }
  req.flash("success", "Cart Updated");
  res.redirect("/cart/checkout");
});

/*
 *  Get clear cart
 */
router.get("/clear", (req, res) => {
  delete req.session.cart;

  req.flash("success", "Cart Cleared!");
  res.redirect("/cart/checkout");
});

/*
 *  Get order now
 */
router.get("/order", (req, res) => {
  delete req.session.cart;
  
  req.flash("success", "Ordered Placed!");
  res.redirect("/");
});

// Exports
module.exports = router;
