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

// Sử dụng pre-save middleware để tạo UUID cho _id
messageSchema.pre('save', function (this: MessageType, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (!this._id) {
        this._id = uuid();
    }
    next();
});

const Message = mongoose.model<MessageType>('Message', messageSchema);

export default Message;
