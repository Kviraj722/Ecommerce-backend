const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Category = require("../models/category");
const { DATE } = require("sequelize");
const sellerController = () => {
  return {
    createProduct: async (req, res) => {
      try {
        const { productName, description, price, quantity, categoryId } =
          req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({
            errors: errors.array(),
          });
        }
        const product = await Product.create({
          productName: productName,
          description: description,
          price: price,
          quantity: quantity,
          categoryId: categoryId,
        });
        res.status(201).json({
          success: true,
          message: "Product created successfully",
          product,
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "something wrong in create product",
        });
      }
    },
    createCategory: async (req, res) => {
      try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }

        const { name } = req.body;
        // Create the category in the database
        const category = await Category.create({
          name,
        });

        res.status(201).json({
          success: true,
          message: "Category created successfully",
          category,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error creating category",
          error: error.message,
        });
      }
    },
  };
};
module.exports = sellerController;
