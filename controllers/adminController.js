const User = require("../models/user");

const adminController = () => {
  return {
    userProfile: async (req, res) => {
      try {
        const user = await User.findAll({ where: { accountType: "User" } });
        console.log("user ->>>>>>>>>>>", user);
        return res.status(200).json({
          success: true,
          message: "Users's all the information is here",
          user,
        });
      } catch (error) {
        console.log("Error in userProfile", error);
        return res.status(400).json({
          success: false,
          message: "Can not able to fetch the data for the admin",
        });
      }
    },
  };
};

module.exports = adminController;
