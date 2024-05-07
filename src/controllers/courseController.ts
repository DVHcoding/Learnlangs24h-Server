// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import NodeCache from 'node-cache';

const nodeCache = new NodeCache({
    stdTTL: 3600,
});

// ##########################
// #    IMPORT Components   #
// ##########################
import { TryCatch } from '../middleware/error.js';
import Course, { CourseType } from '../models/courseModel.js';
import Lesson from '../models/lessonModel.js';
import UnitLesson from '../models/unitLessonModel.js';
import VideoLecture from '../models/videoLectureModel.js';
import cloudinary from '../config/cloudinary.js';
import ErrorHandler from '../utils/errorHandler.js';
import FillBlankExercise, { Question } from '../models/fillBlankExerciseModel.js';
import UserProcessStatus from '../models/userProcessStatusModel.js';
import { CreateContentUnitLessonRequestType, UpdateUnitLessonAndVideoLectureContentType } from '../types/types.js';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
// Get All Courses
export const getAllCourses = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    let courses: CourseType[];

    if (nodeCache.has('courses')) {
        courses = JSON.parse(nodeCache.get<string | any>('courses'));
    } else {
        courses = await Course.find();
        nodeCache.set('courses', JSON.stringify(courses));
    }

    res.status(200).json({
        success: true,
        courses,
    });
});

// Get All Lessons By Id
export const getAllLessonsByCourseId = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const lessons = await Lesson.find({ course: req.params.id });

    if (!lessons || lessons.length === 0 || lessons == null) {
        return next(new ErrorHandler('Lessons is not found', 404));
    }

    res.status(200).json({
        success: true,
        lessons,
    });
});

// Get All Unit Lessons By CourseID
export const getAllUnitLessonByCourseId = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const unitLessons = await UnitLesson.find({ course: req.params.id });

    if (!unitLessons || unitLessons.length === 0) {
        return next(new ErrorHandler('unitLessons not found!', 404));
    }

    res.status(200).json({
        success: true,
        unitLessons,
    });
});

// Get All Unit Lessons By Lesson Id
export const getAllUnitLessonByLessonId = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra xem params có tồn tại không và không rỗng
    if (!req.params.id) {
        return next(new ErrorHandler('Params not found', 400));
    }

    const unitLessons = await UnitLesson.find({
        lesson: req.params.id,
    });

    if (!unitLessons || unitLessons.length === 0) {
        return next(new ErrorHandler('Unit Lessons not found', 404));
    }

    res.status(200).json({
        success: true,
        unitLessons,
    });
});

// Get UnitLesson By id
export const getUnitLessonById = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const unitLesson = await UnitLesson.findById(req.params.id);

    if (!unitLesson) {
        return next(new ErrorHandler('UnitLesson not found!', 404));
    }

    res.status(200).json({
        success: true,
        unitLesson,
    });
});

// Get Video Lecture By Unit Lesson Id
export const getVideoLectureContent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const videoLectureContent = await VideoLecture.findOne({
        unitLesson: req.params.id,
    });

    if (!videoLectureContent) {
        return next(new ErrorHandler('Video Lecture content not found!', 404));
    }

    res.status(200).json({
        success: true,
        videoLectureContent,
    });
});

// Get FillBlankExercise By Unit Lesson Id
export const getFillBlankExercise = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const fillBlankExercise = await FillBlankExercise.findOne({
        unitLesson: req.params.id,
    });

    if (!fillBlankExercise) {
        return next(new ErrorHandler('Fill In Blank Question not found!', 404));
    }

    res.status(200).json({
        success: true,
        fillBlankExercise,
    });
});

// Get UserProcessStatus
export const getUserProcessStatus = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const unitLessonStatus = await UserProcessStatus.find({
        userId: req.params.id,
    }).populate('unitLessonId');

    if (!unitLessonStatus || unitLessonStatus.length === 0) {
        return next(new ErrorHandler('UserId not found!', 404));
    }

    res.status(200).json({
        success: true,
        unitLessonStatus,
    });
});

export const getUnitLessonIdFromUserProcess = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, unitLessonId } = req.query as { userId: string; unitLessonId: string };

    const userProcessStatus = await UserProcessStatus.findOne({ userId, unitLessonId });

    if (!userProcessStatus) {
        return next(new ErrorHandler('user process status not found!', 404));
    }

    res.status(200).json({
        success: true,
        userProcessStatus,
    });
});

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
// Create New Course
export const newCourse = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { unitName }: { unitName: string } = req.body;

    // file received from client
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const courseImageMimeType = files.courseImage[0].mimetype.split('/').at(-1);
    const fileName = files.courseImage[0].filename;
    const filePath = path.resolve(__dirname, '../uploads', fileName);

    // upload on cloudinary
    const uploadResults = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: 'course-imgs',
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
        message: 'Create Course Successfully!',
    });
});

// Create New Lesson
export const newLesson = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { name, courseId }: { name: string; courseId: string } = req.body;

    await Lesson.create({
        name,
        createAt: Date.now(),
        course: courseId,
    });

    res.status(200).json({
        success: true,
        message: 'Create a new lesson successfully',
    });
});

// Create New UnitLesson
export const newUnitLesson = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
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
        message: 'Create Unit Lesson successfully',
    });
});

// Create Content for UnitLesson
export const createContentUnitLesson = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { videoUrl, totalTime, description, unitLesson }: CreateContentUnitLessonRequestType = req.body;

    if (videoUrl === '' || totalTime === '' || description === '' || unitLesson === '') {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    await VideoLecture.create({
        videoUrl,
        totalTime,
        description,
        unitLesson,
    });

    res.status(200).json({
        success: true,
        message: 'Create new content successfully!',
    });
});

// Create fillBlankExercise
export const newFillBlankExercise = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { unitLesson, questions }: { unitLesson: string; questions: Question[] } = req.body;

    if (!unitLesson || !questions) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    await FillBlankExercise.create({
        unitLesson,
        questions,
    });

    res.status(200).json({
        success: true,
        message: 'Created a new fill-in-the-blank exercise successfully',
    });
});

// Create New UserProcessStatus
export const newUserProcessStatus = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, unitLessonId }: { userId: string; unitLessonId: string } = req.body;

    if (!userId || !unitLessonId) {
        return next(new ErrorHandler('Please enter all fields!', 400));
    }

    await UserProcessStatus.create({ userId, unitLessonId });

    res.status(200).json({
        success: true,
        message: 'Create new user process status successfully',
    });
});

/* -------------------------------------------------------------------------- */
/*                                   UPDATE                                   */
/* -------------------------------------------------------------------------- */

// Update UnitLesson + VideoLectureContent
export const updateUnitLessonAndVideoLectureContent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { _id, title, time, lesson, videoUrl, totalTime, description }: UpdateUnitLessonAndVideoLectureContentType = req.body;

    if (!title || !time || !lesson || !videoUrl || !totalTime || !description) {
        return next(new ErrorHandler('Please Enter All Fields!', 400));
    }

    // Cập nhật nội nội dung unitLesson model
    const unitLesson = await UnitLesson.findByIdAndUpdate(_id, { title, time, lesson, createAt: Date.now() });
    if (!unitLesson) {
        return next(new ErrorHandler('Unit Lesson Id not found!', 404));
    }
    await unitLesson.save();

    // Cập nhật nội dung videoLectureContent  model
    const videoLectureContent = await VideoLecture.findOneAndUpdate({ unitLesson: _id }, { videoUrl, description, totalTime });
    if (!videoLectureContent) {
        return next(new ErrorHandler('Unit Lesson Id not found!', 404));
    }

    await videoLectureContent.save();

    res.status(200).json({
        success: true,
        message: 'Update Unit Lesson successfully',
    });
});

// Update User Process Status
export const updateUserProcessStatus = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, unitLessonId }: { userId: string; unitLessonId: string } = req.body;

    if (!userId || !unitLessonId) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    const userProcessStatus = await UserProcessStatus.findOneAndUpdate({ userId, unitLessonId }, { status: 'completed' });

    if (!userProcessStatus) {
        return next(new ErrorHandler('user process not found!', 404));
    }

    await userProcessStatus.save();

    res.status(200).json({
        success: true,
        message: 'update status successfully!',
    });
});
