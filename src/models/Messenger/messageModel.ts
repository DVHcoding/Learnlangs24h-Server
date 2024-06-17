// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

type Attachments = {
    public_id: string;
    url: string;
};

export interface MessageType extends mongoose.Document {
    content: string;
    attachments: Attachments[];
    sender: mongoose.Types.ObjectId;
    chat: mongoose.Types.ObjectId;
    updateAt?: Date;
    createAt?: Date;
}

const messageSchema = new Schema(
    {
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
