const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
    console.log("token in try", token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.exp <= Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ message: "Token has expired." });
      }

      console.log("decode -> ", decoded);
      req.user = decoded;
    } catch (error) {
      console.log("token - catch ", token);
      console.log("error in catch", error);
      return res.status(401).json({
        success: false,
        message: "token is invalid in authMid",
        error,
      });
    }

    next();
  } catch (error) {
    console.log("auth middlaeware error", error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong in auth middlware",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    console.log("user", req.user.accountType);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for admin onlys",
      });
    }
    next();
  } catch (error) {
    console.log("eroro", error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.isUser = async (req, res, next) => {
  try {
    if (req.user.accountType !== "User") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for User only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error while in isUser authentication",
      error,
    });
  }
};

exports.isSeller = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Seller") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Seller only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error while in isUser authentication",
      error,
    });
  }
};
