// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

export interface ChatType extends mongoose.Document {
    name: string;
    groupChat: boolean;
    creator: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const chatSchema = new Schema(
    {
        name: [String],
        groupChat: {
            type: Boolean,
            default: false,
        },
        creator: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        members: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    },
);

const Chat = mongoose.model<ChatType>('Chat', chatSchema);

export default Chat;
