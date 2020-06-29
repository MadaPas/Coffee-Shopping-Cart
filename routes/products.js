const express = require("express");
const router = express.Router();

// Get product model
var Product = require("../models/product");

/*
 *  Get all products
 */
router.get("/", (req, res) => {
  Product.find((err, products) => {
    if (err) console.log(err);
    res.render("allProducts", {
      title: "All Products",
      products //result
    });
  });
});

/*
 *  Get products by category
 */
router.get("/:category", (req, res) => {
  const categorySlug = req.params.category;
  Category.findOne({
    slug: categorySlug
  }, (err, category) => {
    Product.find({
      category: categorySlug
    }, (err, products) => {
      if (err) console.log(err);
      res.render("catProducts", {
        title: category.title,
        products
      });
    });
  });
});

/*
 *  Get products details
 */
router.get("/:category/:product", (req, res) => {
  var loggedIn = req.isAuthenticated() ? true : false;
  Product.findOne({
    slug: req.params.product
  }, (err, product) => {
    if (err) console.log(err);
    else {
      res.render("product", {
        title: product.title,
        product,
        loggedIn
      });
    }
  });
});

// Exports
module.exports = router;