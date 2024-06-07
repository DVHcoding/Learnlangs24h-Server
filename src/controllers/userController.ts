// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

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

export const followUser = TryCatch(async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
        return next(new ErrorHandler('Please provide userId', 400));
    }

    const userObjectId = new Types.ObjectId(req.user?.id);
    const userToFollowObjectId = new Types.ObjectId(userId);

    // Kiểm tra và cập nhật trạng thái theo dõi và người theo dõi
    const [resultUser, resultUserToFollow] = await Promise.all([
        Users.updateOne({ _id: userObjectId }, { $addToSet: { following: userToFollowObjectId } }),
        Users.updateOne({ _id: userToFollowObjectId }, { $addToSet: { followers: userObjectId } }),
    ]);

    if (resultUser.modifiedCount === 0 || resultUserToFollow.modifiedCount === 0) {
        return next(new ErrorHandler('Không thể theo dõi người dùng. Vui lòng thử lại sau!', 400));
    }

    res.status(200).json({
        success: true,
        message: 'User followed successfully',
    });
});

export const unFollow = TryCatch(async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
        return next(new ErrorHandler('Please provide userId', 400));
    }

    const userObjectId = new Types.ObjectId(req.user?.id);
    const userToUnFollowObjectId = new Types.ObjectId(userId);

    // Kiểm tra và cập nhật trạng thái theo dõi và người theo dõi
    const [resultUnFollow, resultRemoveFollower] = await Promise.all([
        Users.updateOne({ _id: req.user?.id }, { $pull: { following: userToUnFollowObjectId } }),

        Users.updateOne({ _id: userId }, { $pull: { followers: userObjectId } }),
    ]);

    if (resultUnFollow.modifiedCount === 0) {
        return next(new ErrorHandler('Hủy follow thất bại. Vui lòng thử lại sau!', 400));
    }

    if (resultRemoveFollower.modifiedCount === 0) {
        return next(new ErrorHandler('Có lỗi xảy ra vui lòng thử lại!', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
    });
});

export const addFriend = TryCatch(async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
        return next(new ErrorHandler('Please provide userId', 400));
    }

    const userObjectId = new Types.ObjectId(req.user?.id);
    const userToAddFriendObjectId = new Types.ObjectId(userId);

    // Kiểm tra và cập nhật trạng thái bạn bè và người theo dõi

    /**
     * $addToSet: Chỉ thêm một phần tử vào mảng nếu nó chưa tồn tại trong mảng.
     * Điều này có nghĩa là nó giúp ngăn chặn các mục trùng lặp trong mảng.
     *
     * $push: Thêm một phần tử vào mảng bất kể nó đã tồn tại trong mảng hay chưa,
     * điều này có thể dẫn đến các mục nhập trùng lặp.
     */
    const [resultUser, resultUserToAddFriend] = await Promise.all([
        Users.updateOne(
            { _id: req.user?.id },
            {
                $addToSet: { following: userToAddFriendObjectId, friends: userToAddFriendObjectId },
            },
        ),

        Users.updateOne(
            { _id: userId },
            {
                $addToSet: { friends: userObjectId, followers: userObjectId },
            },
        ),
    ]);

    if (resultUser.matchedCount === 0) {
        return next(new ErrorHandler('Đối phương không theo dõi hoặc hủy theo dõi bạn!', 400));
    }

    if (resultUser.modifiedCount === 0 || resultUserToAddFriend.modifiedCount === 0) {
        return next(new ErrorHandler('Không thể kết bạn. Vui lòng thử lại sau!', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Cả hai đã trở thành bạn bè!',
    });
});

export const unFriend = TryCatch(async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
        return next(new ErrorHandler('Please provide userId', 400));
    }

    const userObjectId = new Types.ObjectId(req.user?.id);
    const userToUnFriendObjectId = new Types.ObjectId(userId);

    // Sử dụng điều kiện để kiểm tra và cập nhật trực tiếp
    const [resultUser, resultUserToUnFriend] = await Promise.all([
        Users.updateOne(
            { _id: req.user?.id },
            {
                $pull: { friends: userToUnFriendObjectId, following: userToUnFriendObjectId },
            },
        ),

        Users.updateOne(
            { _id: userId },
            {
                $pull: { friends: userObjectId, followers: userObjectId },
            },
        ),
    ]);

    if (resultUser.modifiedCount === 0 || resultUserToUnFriend.modifiedCount === 0) {
        return next(new ErrorHandler('Không thể hủy kết bạn. Vui lòng thử lại sau!', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Hủy kết bạn thành công!',
    });
});
