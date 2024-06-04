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
        origin: '*', // Cấu hình CORS nếu cần thiết
        methods: ['GET', 'POST'],
    },
});

const userSocketIDs = new Map();

// Lắng nghe sự kiện kết nối từ client
io.on('connection', (socket) => {
    const user = {
        _id: 'abcid01',
        name: 'hung',
    };

    userSocketIDs.set(user._id, socket.id);
    console.log(userSocketIDs);

    // Lắng nghe sự kiện NEW_MESSAGE
    socket.on(NEW_MESSAGE, async ({ chatId, members, messages }) => {
        const messageForRealTime = {
            content: messages,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
        };

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
