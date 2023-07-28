const express = require("express");
const router = express.Router();
const { body, check, param } = require("express-validator");
const { isSeller } = require("../middlewares/Auth");
const sellerController = require("../controllers/sellerController");
const Category = require("../models/category");
const { auth } = require("../middlewares/Auth");

//product routes
router.post(
  "/product",
  auth,
  isSeller,
  [
    body("productName").notEmpty().withMessage("Product name is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("quantity")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ],
  sellerController().createProduct
);
router.get("/products", auth, isSeller, sellerController().getAllProducts);
router.get("/products/:id", auth, isSeller, sellerController().getProductById);
router.put("/products/:id", auth, isSeller, sellerController().updateProduct);
router.delete(
  "/products/:id",
  auth,
  isSeller,
  sellerController().deleteProduct
);

//category routes
router.post("/category", auth, isSeller, sellerController().createCategory);
router.put(
  "/updateCategory/:id",
  auth,
  isSeller,
  [
    body("name").trim().notEmpty().withMessage("Category name cannot be empty"),
    body("name").custom(async (value, { req }) => {
      const categoryId = req.params.id;
      const existingCategory = await Category.findOne({
        where: { name: value },
      });
      if (existingCategory && existingCategory.id !== Number(categoryId)) {
        throw new Error("Category name already exists");
      }
      return true;
    }),
  ],
  sellerController().update
);
router.delete(
  "/category/:id",
  auth,
  isSeller,
  [param("id").isInt().withMessage("Invalid category ID")],
  sellerController().delete
);
router.get("/category", auth, isSeller, sellerController().getAll);
router.get("/category/:id", auth, isSeller, sellerController().getCategoryById);

module.exports = router;
