// ##########################
// #      IMPORT NPM        #
// ##########################
import { Response } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################

const sendToken = async (user: any, statusCode: number, res: Response) => {
  const token = user.getJWTToken();
  const refreshToken = await user.generateRefreshToken();

  // options for cookie
  const millisecondsInOneDay = 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.COOKIE_EXPIRE) * millisecondsInOneDay
    ),
    httpOnly: true,
    secure: true,
  };

  const optionsRefresh = {
    expires: new Date(
      Date.now() +
        Number(process.env.COOKIE_REFRESH_EXPIRE) * millisecondsInOneDay
    ),
    httpOnly: true,
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("refresh_token", refreshToken, optionsRefresh)
    .json({
      success: true,
      user,
      token,
    });
};

export default sendToken;
