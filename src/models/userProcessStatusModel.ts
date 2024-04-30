// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from "mongoose";

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
    ref: "User",
    required: true,
  },
  unitLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UnitLesson",
  },
  status: {
    type: String,
    enum: ["unlock", "completed", "lock"],
    default: "lock",
  },
  completedAt: {
    type: Date,
  },
});

const UserProcessStatus = mongoose.model<UserProcessStatusType>(
  "UserProcessStatus",
  userProcessStatusSchema
);

export default UserProcessStatus;
