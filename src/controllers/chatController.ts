// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// ##########################
// #    IMPORT Components   #
// ##########################
import { TryCatch } from '../middleware/error.js';
import Chat, { ChatType } from '../models/Messenger/chatModel.js';
import { userDetailsType } from '../types/types.js';
import { getOtherMember } from '../utils/helper.js';

export const newGroupChat = TryCatch(async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
    const { name, members }: { name: string; members: string } = req.body;

    const allMembers = [...members, req.user?.id];

    await Chat.create({
        name,
        groupChat: true,
        creator: req.user?.id,
        members: allMembers,
    });

    return res.status(201).json({
        success: true,
        message: 'Group Created',
    });
});

export const getMyChats = TryCatch(async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    //### Tìm các cuộc trò chuyện mà trong đó người dùng hiện tại là thành viên
    const chats: ChatType[] = await Chat.find({ members: userId }).populate('members', 'username photo');

    //### Chuyển đổi các cuộc trò chuyện để trả về định dạng mong muốn
    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
        //### Lấy thông tin thành viên khác (ngoài người dùng hiện tại) trong cuộc trò chuyện
        const otherMember = getOtherMember(members, userId);

        return {
            _id,
            groupChat,
            //### Nếu là nhóm chat, lấy tối đa 3 avatar của các thành viên nhóm
            //### Nếu là chat riêng, chỉ lấy avatar của thành viên khác
            avatar: groupChat ? members.slice(0, 3).map(({ photo }) => photo.url) : [otherMember?.photo?.url],

            //### Nếu là nhóm chat, sử dụng tên nhóm, nếu không thì sử dụng tên của thành viên khác
            name: groupChat ? name : otherMember?.username,

            //### Lọc các thành viên khác (ngoài người dùng hiện tại) để trả về danh sách thành viên
            //### prev ở đây chính là giá trị khởi tạo ban đầu (ở đây tôi đặt là mảng rỗng)
            members: members.reduce((prev, member) => {
                if (member._id !== userId) {
                    prev.push(member._id);
                }
                return prev;
            }, [] as mongoose.Types.ObjectId[]),
        };
    });

    // Trả về phản hồi thành công với danh sách các cuộc trò chuyện đã chuyển đổi
    return res.status(200).json({
        success: true,
        chats: transformedChats,
    });
});
