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
import { removeVietnameseTones } from '../utils/regexVietnamese.js';
import { UserRequestType } from '../types/types.js';

// RegisterUser Controller
export const registerUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, photo }: UserRequestType = req.body;

    // Nếu đăng kí thiếu trường username, email hoặc password thì trả về lỗi 400
    if (!username || !email || !password || username === '' || email === '' || password === '') {
        return next(new ErrorHandler('Please add all fields', 400));
    }

    // Lấy thời gian hiện tại tính bằng mili giây
    const milliseconds = new Date().getTime();

    // Chuyển giá trị mili giây thành chuỗi và lấy 4 chữ số cuối cùng
    const lastFourDigits = milliseconds.toString().slice(-4);

    // Loại bỏ ký tự việt nam và dấu cách khỏi username và thêm 4 số đằng sau
    const nickname: string = `${removeVietnameseTones(username.split('').join(''))}${lastFourDigits}`;

    // Kiểm tra trùng lặp nickname
    const existingUser = await Users.findOne({ nickname });

    if (existingUser) {
        return next(new ErrorHandler('Nickname đã tồn tại vui lòng thử lại!', 400));
    }

    // Tạo documents mới vào bảng users với các thông tin người dùng nhập
    const user = await Users.create({
        nickname,
        username,
        email,
        password,
        photo: {
            public_id: photo.public_id,
            url: photo.url,
        },
    });

    // gọi hàm tạo token();
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

    // Nếu không tìm thấy thì trả về lỗi (status: 401);
    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Kiểm tra password người dùng nhập có chính xác không
    const isPasswordMatched = await user.comparePassword(password);

    // Nếu không chính xác trả về status lỗi 401
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
        // Lấy thời gian hiện tại tính bằng mili giây
        const milliseconds = new Date().getTime();
        // Chuyển giá trị mili giây thành chuỗi và lấy 4 chữ số cuối cùng
        const lastFourDigits = milliseconds.toString().slice(-4);

        // Loại bỏ ký tự việt nam và dấu cách khỏi username và thêm 4 số đằng sau
        const nickname: string = `${removeVietnameseTones(username.split('').join(''))}${lastFourDigits}`;

        // Kiểm tra trùng lặp nickname
        const existingUser = await Users.findOne({ nickname });

        if (existingUser) {
            return next(new ErrorHandler('Nickname đã tồn tại vui lòng thử lại!', 400));
        }

        const userGoogle = await Users.create({
            nickname,
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
