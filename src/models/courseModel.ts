// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from "mongoose";

// ##########################
// #    IMPORT Components   #
// ##########################

export interface CourseType extends mongoose.Document {
  name: string;
  image: {
    public_id: string;
    url: string;
  };
  createAt: Date;
  rating: number;
}

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  createAt: {
    type: String,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 0,
  },
});

const Course = mongoose.model<CourseType>("Course", courseSchema);

export default Course;
