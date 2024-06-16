// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

// ##########################
// #    IMPORT Components   #
// ##########################

interface UserProcessStatusType extends mongoose.Document {
    userId: string;
    unitLessonId: string;
    status: string;
    completedAt: Date;
}

const userProcessStatusSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    unitLessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnitLesson',
        sparse: true,
    },
    status: {
        type: String,
        enum: ['unlock', 'completed', 'lock'],
        default: 'unlock',
    },
    completedAt: {
        type: Date,
    },
});

const UserProcessStatus = mongoose.model<UserProcessStatusType>('UserProcessStatus', userProcessStatusSchema);

export default UserProcessStatus;
