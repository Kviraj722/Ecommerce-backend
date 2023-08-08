const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Category = require("../models/category");
const { DATE } = require("sequelize");
const resFunction = require("../Services/resFunction");
const paginate = require("../Services/paginate");

const Order = require("../models/order");
const User = require("../models/user");
const { logger } = require("../logger/log");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const customerController = () => {
  return {
    purchaseProduct: async (req, res) => {
      const customerId = req.user.id;
      const productId = req.params.id;
      try {
        const customer = await User.findByPk(customerId);
        const product = await Product.findByPk(productId);
        if (!customer || !product) {
          return res
            .status(404)
            .json({ error: "Customer or Product not found" });
        }
        if (product.quantity <= 0) {
          return res.status(200).json({
            success: false,
            message: "Stock not available.",
          });
        }
        product.quantity = parseInt(product.quantity - 1);
        await product.save();
        if (!customer.stripeCustomerId) {
          const stripeCustomer = await stripe.customers.create({
            email: customer.email,
            name: customer.firstName,
            address: {
              // Modify to include customer's address
              line1: customer.address.line1,
              line2: customer.address.line2,
              city: customer.address.city,
              state: customer.address.state,
              postal_code: customer.address.postalCode,
              country: customer.address.country,
            },
          });
          customer.stripeCustomerId = stripeCustomer.id;
          await customer.save();
        }
        const cardDetails = req.body.cardToken;
        const paymentMethod = await stripe.paymentMethods.create({
          type: "card",
          card: {
            token: cardDetails,
          },
        });
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customer.stripeCustomerId,
        });

        await stripe.customers.update(customer.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });
        const paymentIntent = await stripe.paymentIntents.create({
          amount: product.price * 100,
          currency: "usd",
          customer: customer.stripeCustomerId,
          description: "Payment for Product Purchase",
          payment_method: paymentMethod.id,
          off_session: true,
          confirm: true,
          shipping: {
            name: customer.firstName,
            address: {
              line1: customer.address.line1,
              line2: customer.address.line2,
              city: customer.address.city,
              state: customer.address.state,
              postal_code: customer.address.postalCode,
              country: customer.address.country,
            },
          },
        });
        const order = await Order.create({
          user_id: customerId,
          sellerId: product.sellerId,
          order_date: new Date(),
          total_amount: product.price,
          isPaid: true,
          paymentIntentId: paymentIntent.id,
          isCancelled: false,
        });
        logger.log(
          "info",
          `successful order of the customer ${customerId} and the seller is ${product.sellerId} `
        );

        return resFunction.sendSuccessResponse(
          200,
          res,
          "Payment successfully",
          order
        );
      } catch (error) {
        logger.log("error", "error");
        return resFunction.sendErrorResponse(
          500,
          res,
          error,
          "Internal server error while payment"
        );
      }
    },
    cancelOrder: async (req, res) => {
      const orderId = parseInt(req.params.id);
      try {
        // Find the order by ID
        const order = await Order.findByPk(orderId, {
          include: [{ model: Product, as: "products" }],
        });
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Check if the order is already canceled
        if (order.isCancelled) {
          return res.status(400).json({ error: "Order is already canceled" });
        }

        // Mark the order as canceled
        order.isCancelled = true;
        await order.save();

        // Refund the payment using Stripe
        const paymentIntentId = order.paymentIntentId;
        if (paymentIntentId) {
          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });
        }

        // Increase the product quantity
        const products = order.products;
        for (const product of products) {
          product.quantity = parseInt(product.quantity) + 1;
          await product.save();
        }
        return res
          .status(200)
          .json({ success: true, message: "Order canceled successfully" });
      } catch (error) {
        // logger.error("error ->", error.message);
        return res
          .status(500)
          .json({ error: "Internal server error while canceling order" });
      }
    },
  };
};
module.exports = customerController;
