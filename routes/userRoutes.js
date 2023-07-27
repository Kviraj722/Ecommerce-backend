const express = require("express");
const { auth, isUser, isAdmin } = require("../middlewares/Auth");
const userController = require("../controllers/userController");
const router = express.Router();
const { body, check } = require("express-validator");
const Auth = require("../controllers/auth");
const User = require("../models/user");
const adminController = require("../controllers/adminController");
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
      .isString()
      .withMessage("Address must be in string"),

  ],
  Auth().signIn
);

//admin routes -> create, see user's and seller's profile and update, delete user's
// and seller's account

module.exports = router;
