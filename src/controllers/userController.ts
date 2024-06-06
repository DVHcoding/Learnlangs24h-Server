// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from '../models/userModel.js';
import { TryCatch } from '../middleware/error.js';
import { userDetailsType } from '../types/types.js';
import ErrorHandler from '../utils/errorHandler.js';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

// Xem chi tiết thông tin user
export const userDetails = TryCatch(async (req: Request & { user?: userDetailsType['user'] }, res: Response) => {
    const user = await Users.findById(req.user?.id).select('-googleId');

    res.status(200).json({
        success: true,
        user,
    });
});

// Xem Chi tiết thông tin user bằng nickname
export const userDetailsByNickName = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    // Tìm user có nickname lấy từ thanh URL (example: hhttp://localhost:5173/profile/HungDo3481)
    // và không lấy trường googleId
    const findUserDetailsByNickName = await Users.findOne({ nickname: req.params.nickname }).select('-googleId');

    // Nếu không thấy thì trả về status 404
    if (!findUserDetailsByNickName) {
        return next(new ErrorHandler('User not found!', 404));
    }

    res.status(200).json({
        success: true,
        user: findUserDetailsByNickName,
    });
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
