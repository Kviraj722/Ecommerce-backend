const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Category = require("../models/category");
const { DATE } = require("sequelize");
const resFunction = require("../Services/resFunction");
const paginate = require("../Services/paginate");

const Order = require("../models/order");
const User = require("../models/user");
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
          console.log("in stripeCustomerId block (if)");
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
          currency: "INR",
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
          order_date: new Date(),
          total_amount: product.price,
          isPaid: true,
          paymentIntentId: paymentIntent.id, //
          isCancelled: false,
        });
        return resFunction.sendSuccessResponse(
          200,
          res,
          "Payment successfully",
          order
        );
      } catch (error) {
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
      console.log("orderid -?", orderId);
      try {
        // Find the order by ID
        const order = await Order.findByPk(orderId, {
          include: [{ model: Product, as: "products" }],
        });
        console.log("order ->", order);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Check if the order is already canceled
        if (order.isCancelled) {
          return res.status(400).json({ error: "Order is already canceled" });
        }
        console.log("hi->");

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
        console.log("payment refund");

        // Increase the product quantity
        const products = order.products;
        for (const product of products) {
          product.quantity = parseInt(product.quantity) + 1;
          await product.save();
        }
        console.log("ndfncrn");
        return res
          .status(200)
          .json({ success: true, message: "Order canceled successfully" });
      } catch (error) {
        console.log("erorr->", error.message);
        return res
          .status(500)
          .json({ error: "Internal server error while canceling order" });
      }
    },
    // updatePurchaseOrder: async (req, res) => {
    //   const orderId = parseInt(req.params.id); // Assuming the order ID is passed as a route parameter
    //   const newQuantities = req.body.newQuantities; // An object containing the updated quantities of products
    //   console.log("orderId", orderId);
    //   console.log("newQuantities", newQuantities);
    //   try {
    //     // Find the order by ID
    //     const order = await Order.findByPk(orderId, {
    //       include: [
    //         {
    //           model: Product,
    //           as: "products",
    //           through: { attributes: ["quantity"] },
    //         },
    //       ],
    //     });

    //     console.log("order->", order);
    //     if (!order) {
    //       return res.status(404).json({ error: "Order not found" });
    //     }

    //     // Check if the order is already canceled
    //     if (order.isCancelled) {
    //       return res
    //         .status(400)
    //         .json({ error: "Cannot update a canceled order" });
    //     }

    //     // Update the quantities of products in the OrderItem table
    //     for (const product of order.products) {
    //       const updatedQuantity = newQuantities[product.id] || 0;
    //       if (updatedQuantity < 0) {
    //         return res.status(400).json({ error: "Invalid quantity" });
    //       }

    //       // Calculate the difference in quantity
    //       const diff = updatedQuantity - product.OrderItem.quantity;

    //       // If the quantity is increased, charge the additional amount using Stripe Payment Intent API
    //       if (diff > 0) {
    //         const paymentIntent = await stripe.paymentIntents.create({
    //           amount: diff * product.price * 100,
    //           currency: "INR",
    //           customer: order.user.stripeCustomerId,
    //           description: "Additional Payment for Product Quantity Update",
    //           off_session: true,
    //           confirm: true,
    //         });
    //         // Save the new paymentIntentId in the order
    //         order.paymentIntentId = paymentIntent.id;
    //         await order.save();
    //       } else if (diff < 0) {
    //         // If the quantity is decreased, process a partial refund using Stripe Refund API
    //         const refundAmount = Math.abs(diff) * product.price * 100;
    //         await stripe.refunds.create({
    //           payment_intent: order.paymentIntentId,
    //           amount: refundAmount,
    //         });
    //       }

    //       // Update the quantity in the OrderItem
    //       product.OrderItem.quantity = updatedQuantity;
    //       await product.OrderItem.save();
    //     }

    //     return res
    //       .status(200)
    //       .json({ success: true, message: "Order updated successfully" });
    //   } catch (error) {
    //     return res
    //       .status(500)
    //       .json({ error: "Internal server error while updating order" });
    //   }
    // },
    
  };
};
module.exports = customerController;
