// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose from 'mongoose';

// ##########################
// #    IMPORT Components   #
// ##########################

import { userSocketIDs } from '../server.js';

interface UserType {
    _id: string;
}

const getSockets: (users: UserType[]) => string[] = (users) => {
    const sockets = users.map((user: UserType) => userSocketIDs.get(user._id.toString()));
    return sockets;
};

export const getOtherMember = (members: mongoose.Types.ObjectId[], userId: string) =>
    members.find((member) => member._id.toString() !== userId.toString());

export { getSockets };
