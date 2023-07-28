const resObj = {
  sendSuccessResponse: (statusCode, res, message, data) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },
  sendErrorResponse: (statusCode, res, error, message) => {
    console.log("error -> ", error.message);
    res.status(statusCode).json({
      success: false,
      message: message,
      error,
    });
  },
  sendValidationErrorResponse: (statusCode, errors) => {
    res.status(statusCode).json({
      errors: errors.array(),
    });
  },
};

module.exports = resObj;
