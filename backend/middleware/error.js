const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
      err.statusCode = err.statusCode || 500;
      err.message = err.message || "Internal Server Error";

      // Wrong Mongodb Id error

      if (err.name === "CastError") {
            const message = `Resource not found. Invalid: ${err.path}`;
            err = new ErrorHandler(message, 400)
      }

      // mongoose duplicate key error 
      if (err.code === 11000) {
            const message = `user already exist with this ${Object.keys(err.keyValue)} `
            err = new ErrorHandler(message, 400);
      }

      // Wrong JWT error 
      if (err.name === "JsonwebTokenError") {
            const message = `Json web token is invaild, Try again `;
            err = new ErrorHandler(message, 400)
      }

      // JWT Expire error 
      if (err.name === "TokenExpiredError") {
            const message = `Json web token is Expired, Try again `;
            err = new ErrorHandler(message, 400)
      }

      res.status(err.statusCode).json({
            success: false,
            message: err.message
      })
}