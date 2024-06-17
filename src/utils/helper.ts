// ##########################
// #    IMPORT Components   #
// ##########################

import { userSocketIDs } from '../server.js';
import { MemberType } from '../models/Messenger/chatModel.js';

interface UserType {
    _id: string;
}

const getSockets: (users: UserType[]) => string[] = (users) => {
    const sockets = users.map((user: UserType) => userSocketIDs.get(user._id.toString()));
    return sockets;
};

export const getOtherMember = (members: MemberType[], userId: string) =>
    members.find((member) => member._id.toString() !== userId.toString());

export { getSockets };
