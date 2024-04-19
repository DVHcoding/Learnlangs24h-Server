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
import UnitLesson from "../models/unitLessonModel.js";
import VideoLecture from "../models/videoLectureModel.js";
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

// Get All Unit Lessons By CourseID
export const getAllUnitLessonByCourseId = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const unitLessons = await UnitLesson.find({ course: req.params.id });

    if (!unitLessons || unitLessons.length === 0) {
      return next(new ErrorHandler("unitLessons not found!", 404));
    }

    res.status(200).json({
      success: true,
      unitLessons,
    });
  }
);

// Get All Unit Lessons By Lesson Id
export const getAllUnitLessonByLessonId = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const unitLessons = await UnitLesson.find({ lesson: req.params.id });

    if (!unitLessons || unitLessons.length === 0) {
      return next(new ErrorHandler("Unit Lessons not found", 404));
    }

    res.status(200).json({
      success: true,
      unitLessons,
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

// Create New UnitLesson
export const newUnitLesson = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, time, icon, lectureType, lesson, course } = req.body;

    await UnitLesson.create({
      title,
      time,
      icon,
      lectureType,
      createAt: Date.now(),
      lesson,
      course,
    });

    res.status(200).json({
      success: true,
      message: "Create Unit Lesson successfully",
    });
  }
);

// Create Content for UnitLesson
export const createContentUnitLesson = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      videoUrl,
      description,
      unitLesson,
    }: { videoUrl: string; description: string; unitLesson: string } = req.body;

    if (videoUrl === "" || description === "" || unitLesson === "") {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    await VideoLecture.create({
      videoUrl,
      description,
      unitLesson,
    });

    res.status(200).json({
      success: true,
      message: "Create new content successfully!",
    });
  }
);
