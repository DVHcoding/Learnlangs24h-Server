// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from "mongoose";

// ##########################
// #    IMPORT Components   #
// ##########################

interface LessonType extends mongoose.Document {
  name: string;
  createAt: Date;
  course: mongoose.Types.ObjectId;
}

const lessonSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Enter Lesson Name"],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
});

const Lesson = mongoose.model<LessonType>("Lesson", lessonSchema);

export default Lesson;
