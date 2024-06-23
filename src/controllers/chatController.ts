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
import ErrorHandler from '../utils/errorHandler.js';
import Message from '../models/Messenger/messageModel.js';
import { mongoose } from '../libs/libs.js';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
export const getMyChats = TryCatch(
    async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
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
    },
);

export const getChatDetails = TryCatch(
    async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
        const chat = await Chat.findById(req.params.id).populate('members', 'username photo');

        if (!chat) return next(new ErrorHandler('Chat not found!', 404));

        // Kiểm tra xem người dùng hiện tại có trong danh sách thành viên của cuộc trò chuyện hay không
        if (!chat.members.some((member) => member._id.toString() === req.user?.id)) {
            return next(new ErrorHandler('You are not allowed to access this chat!', 403));
        }

        // Trả về phản hồi thành công với danh sách các cuộc trò chuyện đã chuyển đổi
        return res.status(200).json({
            success: true,
            chat,
        });
    },
);

export const getMessages = TryCatch(
    async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
        /////////////////////////////////////////////////////////////////
        const chatId: string = req.params.id;
        const page: number = parseInt(req.query.page as string, 10) || 1;

        const userId = req.user?.id as string;
        /////////////////////////////////////////////////////////////////

        // Biến skip được tính toán để xác định số lượng tin nhắn cần bỏ qua
        // dựa trên trang hiện tại. Ví dụ, nếu người dùng đang ở trang thứ 2,
        // skip sẽ là (2 - 1) * 20 = 20, nghĩa là bỏ qua 20 tin nhắn đầu tiên.
        /////////////////////////////////////////////////////////////////
        const resultPerPage: number = 20;
        const skip = (page - 1) * resultPerPage;
        /////////////////////////////////////////////////////////////////

        // Kiểm tra xem kết quả đã được lưu trong cache chưa
        /////////////////////////////////////////////////////////////////
        // const cacheKey = `messages_${chatId}_${page}`;
        // const cachedMessages = nodeCache.get<CachedMessages>(cacheKey);

        // if (cachedMessages) {
        //     return res.status(200).json({
        //         success: true,
        //         messages: cachedMessages.messages,
        //         totalPages: cachedMessages.totalPages,
        //     });
        // }
        /////////////////////////////////////////////////////////////////

        const chat = await Chat.findById(chatId);

        /////////////////////////////////////////////////////////////////
        if (!chat) return next(new ErrorHandler('Chat not found', 404));
        if (!chat.members.includes(userId)) {
            return next(new ErrorHandler('You are not allowed to access this chat', 403));
        }
        /////////////////////////////////////////////////////////////////

        // Skip sử dụng để bỏ qua (Số tài liệu) đầu tiên. Ví dụ skip(5) bỏ qua 5 tài liệu đầu tiên
        /////////////////////////////////////////////////////////////////
        const [messages, totalMessagesCount] = await Promise.all([
            Message.find({ chat: chatId })
                .sort({ createdAt: -1 }) // Sắp xếp tin nhắn theo thứ tự thời gian giảm dần (tin nhắn mới nhất trước).
                .skip(skip)
                .limit(resultPerPage)
                .populate('sender', 'username')
                .lean(),

            Message.countDocuments({ chat: chatId }), // Đếm tổng số tin nhắn trong cuộc trò chuyện có chatId
        ]);
        /////////////////////////////////////////////////////////////////

        // totalMessagesCount là tổng số lượng tin nhắn trong cuộc trò chuyện.
        // Math.ceil(totalMessagesCount / resultPerPage) tính toán tổng số trang
        // cần thiết để hiển thị tất cả tin nhắn, mỗi trang có resultPerPage tin nhắn.
        // Math.ceil làm tròn lên để đảm bảo rằng nếu có tin nhắn lẻ, chúng vẫn được
        // hiển thị trong một trang riêng.Nếu không có tin nhắn nào, totalPages sẽ là 0.
        const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

        // Lưu kết quả vào cach
        /////////////////////////////////////////////////////////////////
        // nodeCache.set(cacheKey, {
        //     messages: messages.reverse(),
        //     totalPages,
        // });
        /////////////////////////////////////////////////////////////////

        // Tại sao lại sử dụng reverse()?
        // Khi bạn truy vấn cơ sở dữ liệu để lấy danh sách các tin nhắn (messages),
        // bạn đã sử dụng .sort({ createdAt: -1 }) để sắp xếp chúng theo thứ tự
        // thời gian giảm dần (tin nhắn mới nhất trước).
        //
        // Điều này có nghĩa là:
        //
        // - Tin nhắn mới nhất sẽ nằm ở đầu mảng.
        // - Tin nhắn cũ nhất sẽ nằm ở cuối mảng.
        //
        // Tuy nhiên, khi hiển thị các tin nhắn trong giao diện người dùng, bạn có thể
        // muốn hiển thị các tin nhắn theo thứ tự thời gian tăng dần, tức là:
        //
        // - Tin nhắn cũ nhất sẽ nằm ở đầu mảng.
        // - Tin nhắn mới nhất sẽ nằm ở cuối mảng.
        //
        // Để đạt được điều này, bạn sử dụng reverse() để đảo ngược thứ tự của các tin
        // nhắn trước khi gửi chúng về phía client.

        /////////////////////////////////////////////////////////////////
        return res.status(200).json({
            success: true,
            messages: messages.reverse(),
            totalPages,
        });
        /////////////////////////////////////////////////////////////////
    },
);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
export const getChatById = TryCatch(
    async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
        const userId = req.user?.id as string;
        const chatById = await Chat.findOne({
            groupChat: false,
            members: req.params.id,
        });

        if (chatById) {
            return res.status(200).json({
                success: true,
                chatId: chatById._id,
            });
        }

        const { name, members }: { name: string; members: string } = req.body;

        const allMembers = [...members, userId];

        const newChat: ChatType = await Chat.create({
            name,
            groupChat: allMembers.length > 2,
            creator: userId,
            members: allMembers,
        });

        res.status(200).json({
            success: true,
            chatId: newChat._id,
        });
    },
);

export const newGroupChat = TryCatch(
    async (req: Request & { user?: userDetailsType['user'] }, res: Response, next: NextFunction) => {
        const userId = req.user?.id as string;
        const { name, members }: { name: string; members: string } = req.body;

        const allMembers = [...members, userId];

        await Chat.create({
            name,
            groupChat: allMembers.length > 2,
            creator: userId,
            members: allMembers,
        });

        res.status(200).json({
            success: true,
            message: 'New Group created!',
        });
    },
);
