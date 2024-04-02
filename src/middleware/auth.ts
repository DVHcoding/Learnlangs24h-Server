// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const isAuthenticated = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { token, refresh_token } = req.cookies;

  if (!token && !refresh_token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    req.user = await Users.findById(decodedData.id);

    next();
  } catch (error) {
    const user: any = await Users.findOne({
      refreshToken: refresh_token,
    }).select("+refreshToken");

    if (!user || user.refreshToken !== refresh_token) {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }

    // Tạo mới token và refresh token
    const newToken = user.getJWTToken();
    const newRefreshToken = await user.generateRefreshToken();

    const millisecondsInOneDay = 24 * 60 * 60 * 1000;

    const options = {
      expires: new Date(
        Date.now() + Number(process.env.COOKIE_EXPIRE) * millisecondsInOneDay
      ),
      httpOnly: true,
      secure: true,
    };

    res
      .cookie("token", newToken, options)
      .cookie("refresh_token", newRefreshToken, options);

    req.user = user;

    next();
  }
};
