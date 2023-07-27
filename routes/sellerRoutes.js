const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const { isSeller } = require("../middlewares/Auth");
const sellerController = require("../controllers/sellerController");
const { auth } = require("../middlewares/Auth");
router.post(
  "/",
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
router.post("/category", auth, isSeller, sellerController().createCategory);
module.exports = router;
