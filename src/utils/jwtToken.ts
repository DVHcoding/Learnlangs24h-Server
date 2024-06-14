// ##########################
// #      IMPORT NPM        #
// ##########################
import { Response } from 'express';
import Users, { UserDocument } from '../models/Courses/userModel.js';

// ##########################
// #    IMPORT Components   #
// ##########################

export const sendToken = async (user: UserDocument, statusCode: number, res: Response) => {
    const token = user.getJWTToken();
    const refreshToken = await user.generateRefreshToken();

    // options for cookie
    const millisecondsInOneDay = 24 * 60 * 60 * 1000;
    const options = {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * millisecondsInOneDay),
        httpOnly: true,
        secure: true,
    };

    // tạo refresh token mới
    const optionsRefresh = {
        expires: new Date(Date.now() + Number(process.env.COOKIE_REFRESH_EXPIRE) * millisecondsInOneDay),
        httpOnly: true,
        secure: true,
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .cookie('refresh_token', refreshToken, optionsRefresh)
        .json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                createAt: user.createdAt,
                email: user.email,
                photo: user.photo.url,
            },
        });
};

// Hàm tạo token cho google
export const sendGoogleToken = async (user: UserDocument, statusCode: number, res: Response) => {
    const token = user.googleId;

    // options for cookie
    const millisecondsInOneDay = 24 * 60 * 60 * 1000;
    const options = {
        expires: new Date(Date.now() + 7 * millisecondsInOneDay),
        httpOnly: true,
        secure: true,
    };

    // Trả về dữ liệu cho client và tạo một cookie có tên là googleId
    res.status(statusCode)
        .cookie('googleId', token, options)
        .json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                createAt: user.createdAt,
                email: user.email,
                photo: user.photo.url,
                role: user.roles,
            },
        });
};
