const express = require("express");
const router = express.Router();
const { sellerController } = require("../controllers/sellerController");
router.post("/seller", sellerController().create);
