const { Op } = require("sequelize");
const { sequelize } = require("../config/dbconfig");
const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Category = require("../models/category");
const { DATE } = require("sequelize");
const resFunction = require("../Services/resFunction");
const paginate = require("../Services/paginate");
const Order = require("../models/order");
const User = require("../models/user");
const OrderItem = require("../models/orderitem");
const { calculateSellerTotalEarnings } = require("../Services/Stripe");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
          sellerId: req.user.id,
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }

        const { name } = req.body;
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return resFunction.sendValidationErrorResponse(400, errors);
      }

      try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return resFunction.sendErrorResponse(
            404,
            res,
            "",
            "Can not find category's id"
          );
        }

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
        const categories = await Category.findAll({
          include: { model: Product, as: "Product" },
        });

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const allProducts = await Product.findAll({
          include: [
            {
              model: Category,
              as: "Category",
              attributes: ["id", "name"],
            },
          ],
        });
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
        const product = await Product.findByPk(productId, {
          include: [
            {
              model: Category,
              as: "Category",
              attributes: ["name"],
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
        const { productName, description, price, quantity, categoryId } =
          req.body;
        const product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
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

        const product = await Product.findByPk(productId);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

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

    revenue: async (req, res) => {
      const sellerId = req.user.id;
      try {
        const totalAmount = await Order.sum("total_amount", {
          where: {
            sellerId: sellerId,
            isPaid: true,
            isCancelled: false,
          },
        });

        res.json({ totalAmount });
      } catch (error) {
        return resFunction.sendErrorResponse(400, res, error, "can not get");
      }
    },
    payout: async (req, res) => {
      const sellerId = req.user.id;
      try {
        const sellerTotalEarnings = await calculateSellerTotalEarnings(
          sellerId
        );

        const totalAmount = sellerTotalEarnings;
        const sellerAmount = totalAmount * 0.9;
        const adminAmount = totalAmount * 0.1;
        await stripe.payouts.create({
          amount: sellerAmount,
          currency: "usd",
          destination: process.env.SELLER_STRIPE_ACC,
        });
        await stripe.payouts.create({
          amount: adminAmount,
          currency: "usd",
          destination: process.env.ADMIN_STRIPE_ACC,
        });

        // await updateSellerEarningsStatus(sellerId);

        return res.status(200).json({
          success: true,
          message: "Payout successful.",
          sellerPayout: sellerAmount / 100,
          adminPayout: adminAmount / 100,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Payout failed.",
          error: error.message,
        });
      }
    },

    // purchaseHistory: async (req, res) => {
    //   // Retrieve orders and order items for the seller
    //   try {
    //     const sellerId = req.user.id;

    //     // Retrieve orders and order items for the seller
    //     const orders = await Order.findAll({
    //       where: { sellerId },
    //       include: [
    //         {
    //           model: OrderItem,
    //           as: "orderItems",
    //           include: {
    //             model: Product,
    //             as: "product",
    //           },
    //         },
    //       ],
    //     });

    //     // Calculate total earnings for the seller
    //     let totalEarnings = 0;
    //     orders.forEach((order) => {
    //       order.orderItems.forEach((orderItem) => {
    //         totalEarnings += orderItem.subtotal;
    //       });
    //     });

    //     return res.json({
    //       success: true,
    //       purchaseHistory: orders,
    //       totalEarnings,
    //     });
    //   } catch (error) {
    //     console.error("error", error.mes);
    //     return res.status(500).json({
    //       success: false,
    //       message: "Error retrieving purchase history",
    //     });
    //   }
    // },
  };
};
module.exports = sellerController;
