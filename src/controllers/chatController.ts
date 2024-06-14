// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response, NextFunction } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { TryCatch } from '../middleware/error.js';
import Chat, { ChatType } from '../models/Messenger/chatModel.js';
import { userDetailsType } from '../types/types.js';
import { getOtherMember } from '../utils/helper.js';

const newGroupChat = TryCatch(async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
    const { name, members } = req.body;

    const allMembers = [...members, req.user];

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
    // Tìm các cuộc trò chuyện mà trong đó người dùng hiện tại là thành viên
    const chats: ChatType[] = await Chat.find({ members: req.user?.id }).populate('members', 'name photo');

    // // Chuyển đổi các cuộc trò chuyện để trả về định dạng mong muốn
    // const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    //     // Lấy thông tin thành viên khác (ngoài người dùng hiện tại) trong cuộc trò chuyện
    //     const otherMember = getOtherMember(members, req.user?.id as string);

    //     return {
    //         _id,
    //         groupChat,
    //         // Nếu là nhóm chat, lấy tối đa 3 avatar của các thành viên nhóm
    //         // Nếu là chat riêng, chỉ lấy avatar của thành viên khác
    //         avatar: groupChat ? members.slice(0, 3).map(({ photo }) => photo.url) : [otherMember.avatar.url],
    //         // Nếu là nhóm chat, sử dụng tên nhóm, nếu không thì sử dụng tên của thành viên khác
    //         name: groupChat ? name : otherMember.name,
    //         // Lọc các thành viên khác (ngoài người dùng hiện tại) để trả về danh sách thành viên
    //         members: members.reduce((prev, curr) => {
    //             if (curr._id.toString() !== req.user.toString()) {
    //                 prev.push(curr._id);
    //             }
    //             return prev;
    //         }, []),
    //     };
    // });

    // Trả về phản hồi thành công với danh sách các cuộc trò chuyện đã chuyển đổi
    return res.status(200).json({
        success: true,
    });
});
