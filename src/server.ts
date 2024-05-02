// ##########################
// #      IMPORT NPM        #
// ##########################
import dotenv from 'dotenv';
import os from 'os';
dotenv.config();

// ##########################
// #    IMPORT Components   #
// ##########################
import app from './app.js';
import connectDatabase from './config/database.js';

// Lấy số lượng CPU của hệ thống
const numCPUs = os.cpus().length;

// Thiết lập giá trị cho biến UV_THREADPOOL_SIZE
// # Sử dụng hết các luồng của CPU để tăng hiệu suất
process.env.UV_THREADPOOL_SIZE = numCPUs.toString();

// Mongodb
connectDatabase();

// ##########################
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is working on http://localhost:${PORT}`);
});
