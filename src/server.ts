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
import { NEW_MESSAGE } from './constants/events.js';
import { getSockets } from './utils/helper.js';

///////////////////////////////////////////////////////////
// Lấy số lượng CPU của hệ thống
const numCPUs = os.cpus().length;
// Thiết lập giá trị cho biến UV_THREADPOOL_SIZE
// # Sử dụng hết các luồng của CPU để tăng hiệu suất
process.env.UV_THREADPOOL_SIZE = numCPUs.toString();
// Mongodb
connectDatabase();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080'], // Cấu hình CORS nếu cần thiết
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

export const userSocketIDs = new Map();

// Lắng nghe sự kiện kết nối từ client
io.on('connection', (socket) => {
    const user = {
        _id: 'abcid01',
        name: 'hung',
    };

    userSocketIDs.set(user._id.toString(), socket.id);
    console.log(userSocketIDs);

    // Lắng nghe sự kiện NEW_MESSAGE
    socket.on(NEW_MESSAGE, async ({ chatId, members, message }: { chatId: string; members: [{ _id: string }]; message: string }) => {
        // Tạo đối tượng tin nhắn để gửi cho client
        const messageForRealTime = {
            content: message,
            _id: uuid(), // Tạo một ID duy nhất cho tin nhắn
            sender: {
                _id: user._id, // ID của người gửi tin nhắn
                name: user.name, // Tên của người gửi tin nhắn
            },
            chat: chatId, // ID của cuộc trò chuyện
            createdAt: new Date().toISOString(), // Thời gian gửi tin nhắn
        };

        // Tạo đối tượng tin nhắn để lưu vào cơ sở dữ liệu
        const messageForDB = {
            content: message,
            sender: user._id, // ID của người gửi tin nhắn
            chat: chatId, // ID của cuộc trò chuyện
        };

        // Lấy các socket của các thành viên trong cuộc trò chuyện
        const membersSocket = getSockets(members);

        // Gửi tin nhắn mới đến tất cả các socket của các thành viên trong cuộc trò chuyện
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });

        console.log('New message', messageForRealTime);
    });

    // Lắng nghe sự kiện ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is working on http://localhost:${PORT}`);
});
////////////////////////////////////////////////////////////
