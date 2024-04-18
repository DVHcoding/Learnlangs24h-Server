// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ##########################
// #    IMPORT Components   #
// ##########################
import { TryCatch } from "../middleware/error.js";
import Course from "../models/courseModel.js";
import Lesson from "../models/lessonModel.js";
import cloudinary from "../config/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";

// ##########################

// Get All Courses
export const getAllCourses = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const courses = await Course.find();

    res.status(200).json({
      success: true,
      courses,
    });
  }
);

// Get All Lessons By Id
export const getAllLessonsByCourseId = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const lessons = await Lesson.find({ course: req.params.id });

    if (!lessons || lessons.length === 0) {
      return next(new ErrorHandler("Lessons is not found", 404));
    }

    res.status(200).json({
      success: true,
      lessons,
    });
  }
);

// Create New Course
export const newCourse = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { unitName }: { unitName: string } = req.body;

    // file received from client
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const courseImageMimeType = files.courseImage[0].mimetype.split("/").at(-1);
    const fileName = files.courseImage[0].filename;
    const filePath = path.resolve(__dirname, "../uploads", fileName);

    // upload on cloudinary
    const uploadResults = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "course-imgs",
      format: courseImageMimeType,
    });

    // remove recycle file in uploads folder
    await fs.promises.unlink(filePath);

    // get public_id and url from cloudinary data response
    const public_id = uploadResults.public_id;
    const url = uploadResults.url;

    // stored data in mongodb
    await Course.create({
      name: unitName,
      image: {
        public_id,
        url,
        createAt: Date.now(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Create Course Successfully!",
    });
  }
);

// Create New Lesson
export const newLesson = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, courseId }: { name: string; courseId: string } = req.body;

    await Lesson.create({
      name,
      createAt: Date.now(),
      course: courseId,
    });

    res.status(200).json({
      success: true,
      message: "Create a new lesson successfully",
    });
  }
);
