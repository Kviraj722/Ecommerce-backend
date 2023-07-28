const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Category = require("../models/category");
const { DATE } = require("sequelize");
const resFunction = require("../Services/resFunction");
const paginate = require("../Services/paginate");
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
        return resFunction.sendSuccessResponse(
          200,
          res,
          "Product Created Successfully",
          product
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          400,
          res,
          error,
          "Can not create a product"
        );
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

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Category created Successfully",
          category
        );
      } catch (error) {
        return resFunction.sendErrorResponse(401, res, error);
      }
    },
    update: async (req, res) => {
      const id = req.params.id;
      const { name } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return resFunction.sendValidationErrorResponse(400, errors);
      }

      try {
        const category = await Category.findByPk(id);
        if (!category) {
          return resFunction.sendErrorResponse(404, res, "Category not found");
        }
        category.name = name;
        await category.save();
        // await Category.update({ where: { name: name } });
        return resFunction.sendSuccessResponse(
          200,
          res,
          "Category Update successFully",
          category
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          400,
          res,
          error,
          "Can not update the category"
        );
      }
    },
    delete: async (req, res) => {
      const categoryId = req.params.id;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return resFunction.sendValidationErrorResponse(400, errors);
      }

      try {
        // Find the category by ID
        const category = await Category.findByPk(categoryId);

        // If the category does not exist, return a 404 error
        if (!category) {
          return resFunction.sendErrorResponse(
            404,
            res,
            "",
            "Can not find category's id"
          );
        }

        // Delete the category
        await category.destroy();

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Category deleted Successfully"
        );
      } catch (error) {}
    },
    getAll: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log("page ->", page);
        console.log("limit -> ", limit);
        const categories = await Category.findAll({
          include: { model: Product, as: "Product" },
          // as: "virajaliesx",
        });
        // console.log("categories ->>>>>>>", categories);

        const paginatedCategories = paginate(categories, page, limit);
        if (!paginatedCategories) {
          return resFunction.sendErrorResponse(
            404,
            "",
            "",
            "No categories Found"
          );
        }

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Categories fetch successfully",
          paginatedCategories
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          401,
          res,
          error,
          "Can not fetch categories"
        );
      }
    },
    getCategoryById: async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id, 10);
        const category = await Category.findByPk(categoryId, {
          include: { model: Product, as: "Product" },
        });
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Data fetched successfully",
          category
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          401,
          res,
          error,
          "Can not fetch the details"
        );
      }
    },

    getAllProducts: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to 1)
        const limit = parseInt(req.query.limit) || 10; // Get the number of items per page from the query parameters (default to 10)

        // Fetch all products from the database
        // const allProducts = await Product.findAll();
        const allProducts = await Product.findAll({
          include: [
            {
              model: Category,
              as: "Category", // The alias defined in the Product model for the Category association
              attributes: ["id", "name"], // Only include specific Category attributes
            },
          ],
        });
        // Use the paginate function to get the products for the current page
        const paginatedProducts = paginate(allProducts, page, limit);

        return res.status(200).json({
          total: allProducts.length,
          page,
          limit,
          data: paginatedProducts,
        });
      } catch (error) {}
    },
    getProductById: async (req, res) => {
      try {
        const productId = req.params.id;
        console.log("productId ->", productId);
        // Fetch the product from the database with its associated Category information
        const product = await Product.findByPk(productId, {
          include: [
            {
              model: Category,
              as: "Category", // The alias defined in the Product model for the Category association
              attributes: ["name"], // Only include specific Category attributes
            },
          ],
        });

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        return resFunction.sendSuccessResponse(
          200,
          res,
          "fetch all the data successfully",
          product
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          404,
          res,
          error,
          "can not able to fetch the data"
        );
      }
    },
    updateProduct: async (req, res) => {
      try {
        const productId = req.params.id;
        console.log("Product id", productId);
        const { productName, description, price, quantity, categoryId } =
          req.body;

        // Fetch the product from the database
        const product = await Product.findByPk(productId);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        // Check if the category exists
        const existingCategory = await Category.findByPk(categoryId);
        if (!existingCategory) {
          return res.status(404).json({ error: "Category not found" });
        }
        product.productName = productName;
        product.description = description;
        product.price = price;
        product.quantity = quantity;

        await product.save();

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Updated successfully",
          product
        );
      } catch (error) {
        console.error("Error updating product:", error);
        return resFunction.sendErrorResponse(
          500,
          error,
          "Could not update the Product"
        );
      }
    },

    deleteProduct: async (req, res) => {
      try {
        const productId = req.params.id;

        // Fetch the product from the database
        const product = await Product.findByPk(productId);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        // Delete the product from the database
        await product.destroy();

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Deleted Successfully"
        );
      } catch (error) {
        return resFunction.sendErrorResponse(
          500,
          res,
          "can not able to delete product"
        );
      }
    },
  };
};
module.exports = sellerController;
