// ##########################
// #      IMPORT NPM        #
// ##########################
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import os from 'os';
dotenv.config();

// ##########################
// #    IMPORT Components   #
// ##########################
import app from './app.js';
import connectDatabase from './config/database.js';
import { ADD_USER, NEW_MESSAGE, OFFLINE_USERS, ONLINE_USERS, SEEN_MESSAGE } from './constants/events.js';
import { MessageForDBType, NewMessagePayload, SeenMessagePayload } from './types/types.js';
import Users from './models/Users/userModel.js';
import Message, { MessageType } from './models/Messenger/messageModel.js';
import ErrorHandler from './utils/errorHandler.js';
import UserStatus from './models/Users/userStatus.message.js';
import Chat from './models/Messenger/chatModel.js';

///////////////////////////////////////////////////////////
// Lấy số lượng CPU của hệ thống
const numCPUs = os.cpus().length;
// Thiết lập giá trị cho biến UV_THREADPOOL_SIZE
// # Sử dụng hết các luồng của CPU để tăng hiệu suất
process.env.UV_THREADPOOL_SIZE = numCPUs.toString();
// Mongodb
connectDatabase();
///////////////////////////////////////////////////////////

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080'], // Cấu hình CORS nếu cần thiết
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

export const userSocketIDs = new Map();

interface UserSockets {
    userId: string;
    socketId: string;
    lastOnline?: string;
}

interface OfflineUserType {
    userId: string;
    socketId: string;
    lastOnline?: string;
}

let users: UserSockets[] = [];
let offlineUsers: OfflineUserType[] = [];

io.on('connection', (socket) => {
    /////////////////////////////////////////////////////////////////
    socket.on(ADD_USER, async ({ userId }) => {
        const isUserExist = users.find((user) => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit(ADD_USER, users);
        }
    });
    /////////////////////////////////////////////////////////////////

    // Lắng nghe sự kiện NEW_MESSAGE
    socket.on(NEW_MESSAGE, async ({ senderId, chatId, members, message }: NewMessagePayload) => {
        /////////////////////////////////////////////////////////////////
        if (!senderId || !chatId || !members || !message) {
            return;
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        const sender = users.find((user) => user.userId === senderId);
        const receivers = members.filter((member) => member !== senderId);
        const receiversUsers = users.filter((user) => receivers.includes(user.userId));
        const user = await Users.findById(senderId);

        if (!sender) {
            return;
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        // Tạo đối tượng tin nhắn để gửi cho client
        const messageForRealTime = {
            _id: uuid(), // Tạo một ID duy nhất cho tin nhắn
            content: message,
            sender: {
                _id: user?._id, // ID của người gửi tin nhắn
                name: user?.username, // Tên của người gửi tin nhắn
            },
            chat: chatId, // ID của cuộc trò chuyện
            createdAt: new Date().toISOString(), // Thời gian gửi tin nhắn
        };
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        // Tạo đối tượng tin nhắn để lưu vào cơ sở dữ liệu
        const messageForDB: MessageForDBType = {
            content: message,
            sender: user?._id, // ID của người gửi tin nhắn
            chat: chatId, // ID của cuộc trò chuyện
        };
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        if (receiversUsers.length > 0) {
            io.to(receiversUsers.map((receiver) => receiver.socketId))
                .to(sender.socketId)
                .emit(NEW_MESSAGE, {
                    chatId,
                    message: messageForRealTime,
                    sender: senderId,
                });
        } else {
            io.to(sender.socketId).emit(NEW_MESSAGE, {
                chatId,
                message: messageForRealTime,
                sender: senderId,
            });
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        try {
            const messagePromise = Message.create(messageForDB);
            const chatPromise = Chat.findById(chatId);

            const [message, chat] = await Promise.all([messagePromise, chatPromise]);

            if (chat) {
                chat.lastMessage = {
                    content: message.content,
                    sender: user?._id || senderId,
                    seen: false,
                };
                await chat.save();
            }

            if (chat) {
                chat.lastMessage = {
                    content: message.content,
                    sender: user?._id || senderId,
                    seen: false,
                };
                await chat.save();
            }
        } catch (error) {
            return new ErrorHandler(`Có sự cố xảy ra!: ${error}`, 403);
        }
        /////////////////////////////////////////////////////////////////
    });

    // Lắng nghe sự kiện SEEN_MESSAGE
    socket.on(SEEN_MESSAGE, async ({ senderId, chatId, members }: SeenMessagePayload) => {
        /////////////////////////////////////////////////////////////////
        if (!senderId || !chatId || !members) {
            return;
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        const sender = users.find((user) => user.userId === senderId);
        const receivers = members.filter((member) => member !== senderId);
        const receiversUsers = users.filter((user) => receivers.includes(user.userId));

        if (!sender) {
            return;
        }

        /////////////////////////////////////////////////////////////////
        // Tạo đối tượng tin nhắn để gửi cho client
        const lastMessage = {
            _id: uuid(),
            sender: senderId,
            seen: true,
        };
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        if (receiversUsers.length > 0) {
            io.to(receiversUsers.map((receiver) => receiver.socketId))
                .to(sender.socketId)
                .emit(SEEN_MESSAGE, {
                    chatId,
                    lastMessage,
                });
        } else {
            io.to(sender.socketId).emit(SEEN_MESSAGE, {
                chatId,
                lastMessage,
            });
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
        try {
            await Chat.findByIdAndUpdate(chatId, { 'lastMessage.seen': true });
        } catch (error) {
            return new ErrorHandler(`Có sự cố xảy ra!: ${error}`, 403);
        }
        /////////////////////////////////////////////////////////////////
    });

    // Lắng nghe sự kiện ngắt kết nối
    socket.on('disconnect', async () => {
        // users = users.filter((user) => user.socketId !== socket.id);
        // io.emit(ADD_USER, users);
        const user = users.find((user) => user.socketId === socket.id);
        if (user) {
            // Lưu trữ thời gian ngắt kết nối vào cơ sở dữ liệu
            const lastOnline = new Date().toISOString();

            /////////////////////////////////////////////////////////////////
            // Cập nhật danh sách người dùng online
            users = users.filter((user) => user.socketId !== socket.id);
            user.lastOnline = lastOnline;

            const isOfflineUserExist = offlineUsers.find((offlineUser) => offlineUser.userId === user.userId);
            if (!isOfflineUserExist) {
                offlineUsers.push(user);
            }
            /////////////////////////////////////////////////////////////////

            /////////////////////////////////////////////////////////////////
            io.emit(OFFLINE_USERS, offlineUsers);
            io.emit(ADD_USER, users);
            /////////////////////////////////////////////////////////////////

            /////////////////////////////////////////////////////////////////
            try {
                const userStatus = await UserStatus.findOne({ userId: user.userId });

                if (!userStatus) {
                    await UserStatus.create({ userId: user.userId, lastOnline });
                    return;
                }
                await UserStatus.findOneAndUpdate({ userId: user.userId }, { lastOnline });
            } catch (error) {
                return new ErrorHandler(`Có sự cố xảy ra!: ${error}`, 403);
            }

            /////////////////////////////////////////////////////////////////
        }
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is working on http://localhost:${PORT}`);
});
