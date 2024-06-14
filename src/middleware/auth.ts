// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from '../models/Users/userModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import { userDetailsType } from '../types/types.js';

export const isAuthenticated = async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
    // Lấy token, refresh_token và googleId ở cookies từ req (nếu có!)
    const { token, refresh_token, googleId } = req.cookies;

    // Trường hợp có googleId
    if (googleId) {
        // Tìm user có googleId đó trong mongodb
        const userFindGoogleId = await Users.findOne({ googleId });

        // Nếu không tìm thấy thì trả về lỗi 400
        if (!userFindGoogleId) {
            return next(new ErrorHandler('Vui lòng đăng nhập lại!', 400));
        }

        // nếu tìm thấy thì gán req.user bằng với dữ liệu tìm được ở database
        req.user = userFindGoogleId as userDetailsType['user'];

        // tạo mới lại googleId vào cookies
        const googleIdCookies = userFindGoogleId.googleId;
        const millisecondsInOneDay = 24 * 60 * 60 * 1000;
        const options = {
            expires: new Date(Date.now() + 7 * millisecondsInOneDay),
            httpOnly: true,
            secure: true,
        };

        res.cookie('googleId', googleIdCookies, options);
        next();
    } else {
        if (!token && !refresh_token) {
            return next(new ErrorHandler('Please Login to access this resource', 401));
        }

        try {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET!) as {
                id: string;
            };

            req.user = (await Users.findById(decodedData.id)) as userDetailsType['user'];

            next();
        } catch (error) {
            const user = await Users.findOne({
                refreshToken: refresh_token,
            }).select('+refreshToken');

            if (!user || user.refreshToken !== refresh_token) {
                return next(new ErrorHandler('Please Login to access this resource', 401));
            }

            // Tạo mới token và refresh token
            const newToken = user.getJWTToken();
            const newRefreshToken = await user.generateRefreshToken();

            const millisecondsInOneDay = 24 * 60 * 60 * 1000;

            const options = {
                expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * millisecondsInOneDay),
                httpOnly: true,
                secure: true,
            };

            res.cookie('token', newToken, options).cookie('refresh_token', newRefreshToken, options);

            req.user = user as userDetailsType['user'];

            next();
        }
    }
};
