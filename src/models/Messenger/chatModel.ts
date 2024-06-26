// ##########################
// #      IMPORT NPM        #
// ##########################
import { mongoose, Schema, Types } from '../../libs/libs.js';

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
    lastMessage: {
        content: string;
        sender: Types.ObjectId;
        seen: boolean;
    };
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
            type: Types.ObjectId,
            ref: 'Users',
        },
        members: [
            {
                type: Types.ObjectId,
                ref: 'Users',
            },
        ],
        lastMessage: {
            content: {
                type: String,
            },
            sender: {
                type: Types.ObjectId,
                ref: 'Users',
            },
            seen: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    },
);

const Chat = mongoose.model<ChatType>('Chat', chatSchema);

export default Chat;
