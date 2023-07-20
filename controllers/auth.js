const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Auth = () => {
  return {
    login: async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(401).json({
            success: false,
            message: "Please enter email and password",
          });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found, please signin first",
          });
        }
        const payload = {
          email: email,
          id: user.id,
          accountType: user.accountType,
        };
        if (await bcrypt.compare(password, user.password)) {
          let token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });

          user.token = token;
          console.log("user.token", user.token);
          user.password = undefined;
          console.log("user ->>>>>>>", user);
          return res.status(200).json({
            success: true,
            message: `${user.accountType} login successfully`,
            token,
            user,
          });
          // let options = {
          //   expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          //   httpOnly: true,
          // };
          // res.cookie("token", token, options).status(200).json({
          //   success: true,
          //   token,
          //   user,
          //   message: "User logged in successfully",
          // });
        } else {
          res.status(403).json({
            success: false,
            message: "Password do not match",
            user,
          });
        }
      } catch (error) {
        console.log("erroroorororoorokrdskfcjedsjf", error.message);
        return res.status(400).json({
          success: false,
          message: "User cannot loged in, please check authlogin controller",
        });
      }
    },
    signIn: async (req, res) => {
      try {
        const { firstName, lastName, email, password, accountType } = req.body;

        const existingUser = await User.findOne({ where: { email: email } });
        console.log("existing user->>>>>>>", existingUser);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "User already Exists",
          });
        }

        //   TODO Add validtions errors here ->>>>>> done

        const errors = validationResult(req);
        console.log("->>>>>>>>>>>>>>>>>>>>  ", errors);
        if (!errors.isEmpty()) {
          const error = errors.array().map((x) => {
            return {
              field: x.param,
              message: x.msg,
            };
          });
          return res.status(409).json({ error, success: false });
        }

        let securePassword;
        try {
          securePassword = await bcrypt.hash(password, 10);
        } catch (error) {
          console.log("Error while hashing the pwd -> ", error);
          res.status.json({
            success: false,
            message: "not able to hash the password",
            error,
          });
        }
        console.log("secured password -> ", securePassword);

        if (
          req.body.accountType === "Seller" ||
          req.body.accountType === "User"
        ) {
          console.log("Helloooooooooooooooooooooooooooooooooooooooooooooooooo");
          const DATA = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email,
            accountType: req.body.accountType,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            password: securePassword,
          });
        } else {
          const checkAdminIsPresent = await User.findOne({
            where: { accountType: "Admin" },
          });
          console.log("Check admin ->>>>>", checkAdminIsPresent);
          if (checkAdminIsPresent) {
            return res.status(401).json({
              success: false,
              message:
                "You can not create Admin profile if there is one admin present.",
            });
          }
          const DATA = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            accountType: accountType,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            password: securePassword,
          });
        }

        return res.status(200).json({
          success: true,
          message: `User created successfully for the role of ${accountType}`,
        });
      } catch (error) {
        console.log("Error while signing ->>>>>>>>>>>>>>>>>>>>>>", error);
        return res.status(400).json({
          success: false,
          message:
            "User can not be created due to some issue. Please check signin controller.",
          error,
        });
      }
    },
  };
};

module.exports = Auth;
