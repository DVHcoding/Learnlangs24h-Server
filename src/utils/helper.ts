// ##########################
// #    IMPORT Components   #
// ##########################

import { userSocketIDs } from '../server.js';
import { MemberType } from '../models/Messenger/chatModel.js';

interface UserType {
    _id: string;
}

// Hàm getSockets lấy danh sách người dùng và trả về danh sách các socket ID hợp lệ
const getSockets: (users: UserType[]) => string[] = (users) => {
    // Dùng map để lấy socket ID của mỗi người dùng, sau đó lọc bỏ các giá trị undefined
    const sockets = users
        .map((user: UserType) => userSocketIDs.get(user._id))
        .filter((socketId: string | undefined) => socketId !== undefined);
    return sockets;
};

export const getOtherMember = (members: MemberType[], userId: string) => members.find((member) => member._id !== userId);

export { getSockets };
