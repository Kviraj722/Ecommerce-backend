const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = async (req, res, next) => {
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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.exp <= Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ message: "Token has expired." });
      }
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "token is invalid in authMid",
        error,
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong in auth middlware",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for admin onlys",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const isUser = async (req, res, next) => {
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

const isSeller = async (req, res, next) => {
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
      message: "Error while in isSeller authentication",
      error,
    });
  }
};

module.exports = { isAdmin, isUser, isSeller, auth };
