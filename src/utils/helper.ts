// ##########################
// #    IMPORT Components   #
// ##########################

import { MemberType } from '../models/Messenger/chatModel.js';

const getOtherMember = (members: MemberType[], userId: string) => members.find((member) => member._id.toString() !== userId);

export { getOtherMember };
