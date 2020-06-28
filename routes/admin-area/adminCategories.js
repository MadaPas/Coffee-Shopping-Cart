const express = require("express");
const router = express.Router();
const isAdmin = require("../../config/auth").isAdmin;

/* Get category model */
const Category = require("../../models/category");

/* Get categories index */
router.get("/", isAdmin, (req, res) => {
  Category.find((err, categories) => {
    if (err) return console.log(err);
    res.render("admin/categories", {
      categories
    });
  });
});

/* Get add category */
router.get("/addcategory", isAdmin, (req, res) => {
  var title = "";
  res.render("admin/addCategory", {
    title
  });
});

/* Post add category */
router.post("/addcategory", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/addCategory", {
      errors,
      title
    });
  } else {
    Category.findOne({
      slug: slug
    }, (err, cat) => {
      if (cat) {
        req.flash("danger", "Category title exist, choose another.");
        res.render("admin/addCategory", {
          title
        });
      } else {
        var cat = new Category({
          title,
          slug
        });
        cat.save(err => {
          if (err) return console.log(err);
          Category.find((err, categories) => {
            if (err) console.log(err);
            else {
              req.app.locals.categories = categories;
            }
          });

          req.flash("success", "Category added successfully!");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

/* Get edit category */
router.get("/editcategory/:id", isAdmin, (req, res) => {
  Category.findById(req.params.id, (err, cat) => {
    if (err) return console.log(err);
    res.render("admin/editCategory", {
      title: cat.title,
      id: cat._id
    });
  });
});

/* Post edit category */
router.post("/editcategory/:id", (req, res) => {
  req.checkBody("title", "Title must have a value.").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/editCategory", {
      errors,
      title,
      id
    });
  } else {
    Category.findOne({
      slug: slug,
      _id: {
        $ne: id
      }
    }, (err, cat) => {
      if (cat) {
        req.flash("danger", "Category title exist, choose another.");
        res.render("admin/editCategory", {
          title,
          id
        });
      } else {
        Category.findById(id, (err, cat) => {
          if (err) return console.log(err);

          cat.title = title;
          cat.slug = slug;

          cat.save(err => {
            if (err) return console.log(err);
            Category.find((err, categories) => {
              if (err) console.log(err);
              else {
                req.app.locals.categories = categories;
              }
            });

            req.flash("success", "Category edited successfully!");
            res.redirect("/admin/categories/editcategory/" + id);
          });
        });
      }
    });
  }
});

/* Get delete category */
router.get("/deletecategory/:id", isAdmin, (req, res) => {
  Category.findByIdAndRemove(req.params.id, err => {
    if (err) return console.log(err);
    Category.find((err, categories) => {
      if (err) console.log(err);
      else {
        req.app.locals.categories = categories;
      }
    });

    req.flash("success", "Category deleted successfully!");
    res.redirect("/admin/categories/");
  });
});

// Exports
module.exports = router;