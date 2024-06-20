// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

export interface MemberType {
    _id: string;
    username: string;
    photo: {
        public_id: string;
        url: string;
    };
}

export interface ChatType extends mongoose.Document {
    name: string;
    groupChat: boolean;
    creator: mongoose.Types.ObjectId;
    members: (mongoose.Types.ObjectId & MemberType)[] & string;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        groupChat: {
            type: Boolean,
            default: false,
        },
        creator: {
            type: mongoose.Types.ObjectId,
            ref: 'Users',
        },
        members: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Users',
            },
        ],
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    },
);

const Chat = mongoose.model<ChatType>('Chat', chatSchema);

export default Chat;
