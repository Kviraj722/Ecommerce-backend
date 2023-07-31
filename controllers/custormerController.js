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
        })

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
  };
};
module.exports = customerController;
