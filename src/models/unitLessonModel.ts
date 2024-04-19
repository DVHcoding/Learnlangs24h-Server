// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema  } from "mongoose";

// ##########################
// #    IMPORT Components   #
// ##########################

interface UnitLessonType extends mongoose.Document {
  title: string;
  time: string;
  icon: string;
  lectureType: string;
  createAt: Date;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
}

const unitLessonSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  lectureType: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: "Lesson",
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },
});

const UnitLesson = mongoose.model<UnitLessonType>(
  "UnitLesson",
  unitLessonSchema
);

export default UnitLesson;
