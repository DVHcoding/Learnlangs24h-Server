// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from '../models/userModel.js';
import { TryCatch } from '../middleware/error.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sendGoogleToken, sendToken } from '../utils/jwtToken.js';

// ##########################
type UserRequestType = {
    username: string;
    email: string;
    password?: string;
    photo: {
        public_id: string;
        url: string;
    };
    googleId?: string;
};

// RegisterUser Controller
export const registerUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, photo }: UserRequestType = req.body;

    if (!username || !email || !password) {
        return next(new ErrorHandler('Please add all fields', 400));
    }

    const user = await Users.create({
        username,
        email,
        password,
        photo: {
            public_id: photo.public_id,
            url: photo.url,
        },
    });

    sendToken(user, 200, res);
});

// LoginUser Controller (With Email)
export const loginUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: UserRequestType = req.body;

    // Nếu người dùng không nhập email hoặc password thì trả về lỗi (status: 400);
    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email & Password', 400));
    }

    // Tìm tài khoản trong mongodb bằng email (không gửi refreshToken)
    const user = await Users.findOne({ email }).select('+password -refreshToken'); // Phải thêm +password mới đem so sánh đc;

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);
});

// Login User Controller (With Google)
export const loginGoogle = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, photo, googleId }: UserRequestType = req.body;

    const user = await Users.findOne({ googleId });

    if (!user) {
        const userGoogle = await Users.create({
            username,
            email,
            photo: {
                public_id: photo.public_id,
                url: photo.url,
            },
            googleId,
        });

        sendGoogleToken(userGoogle, 200, res);
    } else {
        sendGoogleToken(user, 200, res);
    }
});

// Logout
export const logoutUser = TryCatch(async (req: Request, res: Response) => {
    const cookiesToClear = ['token', 'refresh_token', 'googleId'];

    // Xóa hết cookies nếu người dùng đăng xuất
    cookiesToClear.forEach((cookieName) => {
        res.clearCookie(cookieName, {
            httpOnly: true,
        });
    });

    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công!',
    });
});
