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
    check("firstName").notEmpty().withMessage("FirstName is required"),
    check("lastName").notEmpty().withMessage("LastName is required"),

    // body("accountType").custom((type) => {
    //   if (!type) {
    //     return Promise.reject("accountType field is required");
    //   }
    //   const isAdminPresent = User.findOne({ where: { accountType: "Admin" } });
    //   if (isAdminPresent) {
    //     return Promise.reject(
    //       "You can not create account with account type admin"
    //     );
    //   }
    // }),
  ],
  Auth().signIn
);

//admin routes -> create, see user's and seller's profile and update, delete user's
// and seller's account


module.exports = router;
