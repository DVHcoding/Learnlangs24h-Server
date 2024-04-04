// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response, NextFunction } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import ErrorHandler from "../utils/errorHandler.js";
import { ControllerType } from "../types/types.js";

// ##########################
export const errorMiddleware = (
  err: ErrorHandler & { code?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values for status code and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate email in Mongodb
  if (err.code === 11000) {
    const message = `Email đã được đăng ký`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
  }

  res.status(res.statusCode).json({
    success: false,
    message: err.message,
  });
};

// ###################################
export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
