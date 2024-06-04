import { userSocketIDs } from '../server.js';

interface UserType {
    _id: string;
}

const getSockets: (users: UserType[]) => string[] = (users) => {
    const sockets = users.map((user: UserType) => userSocketIDs.get(user._id.toString()));
    return sockets;
};

export { getSockets };
