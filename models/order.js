const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");
const User = require("../models/user");
const Product = require("../models/product");
const OrderItem = require("../models/orderitem");
const nodemailer = require("nodemailer");
const { logger } = require("../logger/log");
const Order = sequelize.define("Order", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  sellerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  order_date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  total_amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  isPaid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  paymentIntentId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isCancelled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Order.hasMany(OrderItem, {});
Order.belongsToMany(Product, {
  through: "OrderItem",
  foreignKey: "order_id",
  otherKey: "product_id",
  as: "products",
});
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
Order.addHook("afterCreate", async (order, opions) => {
  try {
    const seller = await User.findByPk(order.sellerId);
    console.log("seller ->", seller);
    if (seller.accountType === "Seller") {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnAuthorized: true,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: seller.email,
        subject: "New Order Notification",
        text: `Dear ${seller.firstName},\n\nA new order has been placed by a customer for the product . \nThank you for your business!`,
      };
      transporter.verify((err, success) => {
        if (err) console.log("error ->", err.message);
        else console.log("config is good");
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(info);
      console.log("Order notification email sent to seller.");
    }
  } catch (error) {
    // console.error("Error sending order notification email:", error.message);
    logger.log("error", "error while sending mail");
  }
});
module.exports = Order;
