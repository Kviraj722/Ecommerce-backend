const express = require("express");
const { auth, isUser, isAdmin } = require("../middlewares/Auth");
const userController = require("../controllers/userController");
const router = express.Router();
const { body, check } = require("express-validator");
const Auth = require("../controllers/auth");
const User = require("../models/user");
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/custormerController");
router.post("/login", Auth().login);
router.post(
  "/user/signin",
  [
    body("firstName").notEmpty().withMessage("FirstName is required"),
    body("lastName").notEmpty().withMessage("LastName is required"),
    body("email").notEmpty().withMessage("email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("phoneNumber")
      .notEmpty()
      .withMessage("phoneNumber is required")
      .isString()
      .withMessage("Phone number must be a string")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must contain exactly 10 digits"),
    body("address")
      .notEmpty()
      .withMessage("address required")
      .isObject()
      .withMessage("Address must be in string"),
  ],
  Auth().signIn
);

//customer's routes
router.post(
  "/purchase/:id",
  auth,
  isUser,
  customerController().purchaseProduct
);
router.post("/cancel-order/:id",auth, isUser, customerController().cancelOrder)
// router.put("/update-quantity/:id",auth,isUser,customerController().updatePurchaseOrder)
module.exports = router;
