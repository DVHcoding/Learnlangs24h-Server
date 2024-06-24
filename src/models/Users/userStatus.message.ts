// ##########################
// #    IMPORT Components   #
// ##########################
import { mongoose, Schema, Types } from '../../libs/libs.js';

export interface UserStatusType {
    userId: Types.ObjectId;
    lastOnline: Date;
}

const userStatusSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    lastOnline: {
        type: Date,
        default: null,
    },
});

const UserStatus = mongoose.model<UserStatusType>('UserStatus', userStatusSchema);

export default UserStatus;
