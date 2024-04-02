// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from "../models/userModel.js";
import { TryCatch } from "../middleware/error.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwtToken.js";

// ##########################
// RegisterUser Controller
export const registerUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    const user = await Users.create({
      username,
      email,
      password,
    });

    sendToken(user, 200, res);
  }
);

// LoginUser Controller
export const loginUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user: any = await Users.findOne({ email }).select("+password"); // Phải thêm +password mới đem so sánh đc;

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
  }
);

// Get Details User Controller
export const detailsUser = TryCatch(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const user = await Users.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  }
);
