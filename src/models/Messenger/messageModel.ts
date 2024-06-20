// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

type Attachments = {
    public_id: string;
    url: string;
};

export interface MessageType extends mongoose.Document {
    _id: string;
    content: string;
    attachments: Attachments[];
    sender: mongoose.Types.ObjectId;
    chat: mongoose.Types.ObjectId;
    updateAt?: Date;
    createAt?: Date;
}

const messageSchema = new Schema(
    {
        _id: {
            type: String, // Định nghĩa _id là kiểu String
            default: uuid, // Sử dụng uuid để sinh ra giá trị mặc định cho _id
        },
        content: {
            type: String,
            required: true,
        },
        attachments: [
            {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        chat: {
            type: mongoose.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Message = mongoose.model<MessageType>('Message', messageSchema);

export default Message;
