const express = require("express");
const { auth, isUser, isAdmin } = require("../middlewares/Auth");
const adminController = require("../controllers/adminController");
const router = express.Router();
router.get("/userprofile", auth, isAdmin, adminController().userProfile);

module.exports = router;
