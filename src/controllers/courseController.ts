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
    stdTTL: 3600, // 3600 giây.
});

// ##########################
// #    IMPORT Components   #
// ##########################
import { TryCatch } from '../middleware/error.js';
import Course, { CourseType } from '../models/Courses/courseModel.js';
import Lesson from '../models/Courses/lessonModel.js';
import UnitLesson from '../models/Courses/unitLessonModel.js';
import VideoLecture from '../models/Courses/videoLectureModel.js';
import cloudinary from '../config/cloudinary.js';
import ErrorHandler from '../utils/errorHandler.js';
import FillBlankExercise from '../models/Courses/fillBlankExerciseModel.js';
import UserProcessStatus from '../models/Users/userProcessStatusModel.js';
import {
    CreateUnitLessonAndFillBlankExerciseRequestType,
    CreateUnitLessonAndVideoLectureContentRequestType,
    UpdateUnitLessonAndFillBlankExerciseType,
    UpdateUnitLessonAndVideoLectureContentType,
} from '../types/types.js';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
// Get All Courses
export const getAllCourses = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    let courses: CourseType[];

    // Nếu khóa học đã tồn tại trong cache thì lấy ra dùng
    if (nodeCache.has('courses')) {
        courses = JSON.parse(nodeCache.get<string | any>('courses'));
    } else {
        // Nếu chưa có thì lấy từ database
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
    // Lấy tất cả lesson có course id lấy từ thanh URL (req.params.id)
    const lessons = await Lesson.find({ course: req.params.id });

    // Nếu không có lesson thì trả về status code 404 (NotFound)
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
    // tìm tất cả unitLessons có courseId lấy từ thanh URL
    const unitLessons = await UnitLesson.find({ course: req.params.id });

    // Nếu không có thì trả về statusCode 404 (NotFound)
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

    // Tìm tất cả unitLessons có lessonId lấy từ URL
    const unitLessons = await UnitLesson.find({
        lesson: req.params.id,
    });

    // Nếu không có thì trả về status 404 (NotFound)
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
    // Tìm unitLesson có id lấy từ URL
    const unitLesson = await UnitLesson.findById(req.params.id);

    // Nếu không có thì trả về statusCode 404 (NotFound)
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
    // tìm videoLecture có unitLessonId lấy từ URL
    const videoLectureContent = await VideoLecture.findOne({
        unitLesson: req.params.id,
    });

    // Nếu không có thì trả về statusCode 404 (NotFound)
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
    // Sử dụng populate để lấy chi tiết hơn cho trường unitLessonId thay vì chỉ mỗi ObjectId
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

// Create New UnitLesson And Video Lecture Content
export const newUnitLessonAndVideoLectureContent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const {
        title,
        time,
        icon,
        lectureType,
        lesson,
        course,
        videoUrl,
        description,
        totalTime,
    }: CreateUnitLessonAndVideoLectureContentRequestType = req.body;

    if (
        title === '' ||
        time === '' ||
        icon === '' ||
        lectureType === '' ||
        lesson === '' ||
        course === '' ||
        videoUrl === '' ||
        description === ''
    ) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    // Tạo UnitLesson trước sau đó lấy ra _id của unitLesson vừa tạo
    const unitLessonResponse = await UnitLesson.create({ title, time, icon, lectureType, createAt: Date.now(), lesson, course });
    const unitLesson = unitLessonResponse._id;

    // Tạo nội dung cho unitLesson này ở VideoLecture model
    await VideoLecture.create({ videoUrl, description, unitLesson, totalTime });

    res.status(200).json({
        success: true,
        message: 'Create New UnitLesson successfully',
    });
});

// Create New UnitLesson and FillBlankExercise
export const newUnitLessonAndFillBlankExercise = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { title, time, icon, lectureType, lesson, course, questions }: CreateUnitLessonAndFillBlankExerciseRequestType = req.body;

    if (title === '' || time === '' || icon === '' || lectureType === '' || lesson === '' || course === '' || !questions) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    // Tạo UnitLesson trước sau đó lấy ra _id của unitLesson vừa tạo
    const unitLessonResponse = await UnitLesson.create({ title, time, icon, lectureType, createAt: Date.now(), lesson, course });
    const unitLesson = unitLessonResponse._id;

    // Tạo nội dung cho unitLesson này ở FillBlankExercise model
    await FillBlankExercise.create({ unitLesson, questions });

    res.status(200).json({
        success: true,
        message: 'Create new UnitLesson successfully',
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

// Update UnitLesson + FillBlankExercise
export const updateUnitLessonAndFillBlankExercise = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { _id, title, time, lesson, questions }: UpdateUnitLessonAndFillBlankExerciseType = req.body;

    if (!_id || !title || !time || !lesson || !questions || questions.length === 0) {
        return next(new ErrorHandler('Please enter all fields!', 400));
    }

    // Cập nhật nội nội dung unitLesson model
    const unitLesson = await UnitLesson.findByIdAndUpdate(_id, { title, time, lesson, createAt: Date.now() });
    if (!unitLesson) {
        return next(new ErrorHandler('Unit Lesson Id not found!', 404));
    }
    await unitLesson.save();

    // Cập nhật nội dung fillBlankExercise model
    const fillBlankExercise = await FillBlankExercise.findOneAndUpdate({ unitLesson: _id }, { questions });
    if (!fillBlankExercise) {
        return next(new ErrorHandler('Unit Lesson Id not found!', 404));
    }
    await fillBlankExercise.save();

    res.status(200).json({
        success: true,
        message: 'Update Unit Lesson & Fill Blank Exercise successfully',
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

// Update Lesson Name
export const updateLesson = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId, lessonName }: { lessonId: string; lessonName: string } = req.body;

    // Nếu không có lessonId hoặc lessonName thì trả về lỗi 400 với message
    if (!lessonId || !lessonName) {
        return next(new ErrorHandler('Please Enter all fields!', 400));
    }

    // Tìm kiếm lesson có id tương ứng và update name
    const lesson = await Lesson.findByIdAndUpdate(lessonId, { name: lessonName });

    // Nếu không tìm được thì response về lỗi 404
    if (!lesson) {
        return next(new ErrorHandler('LessonId not found!', 404));
    }

    // Lưu lại
    await lesson.save();

    res.status(200).json({
        success: true,
        message: 'Update lesson successfully',
    });
});

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */
// # Delete UnitLesson And VideoLectureContent
export const deleteUnitLessonAndVideoLectureContent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const unitId = req.query.unitId as string;

    // Xóa unitLesson trước
    const unitLesson = await UnitLesson.findByIdAndDelete({ _id: unitId });

    if (!unitLesson) {
        return next(new ErrorHandler('Unit lesson not found!', 404));
    }

    // Xóa videoLectureContent
    const videoLecture = await VideoLecture.deleteOne({ unitLesson: unitId });

    if (!videoLecture) {
        return next(new ErrorHandler('VideoLectureContent not found!', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Deleted unitLesson successfully',
    });
});

// # Delete UnitLesson And FillBlankExercise
export const deleteUnitLessonAndFillBLankExercise = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const unitId = req.query.unitId as string;

    if (!unitId) {
        return next(new ErrorHandler('unitLesson not found!', 404));
    }

    // Xóa unitLesson trước
    const unitLesson = await UnitLesson.findByIdAndDelete({ _id: unitId });

    if (!unitLesson) {
        return next(new ErrorHandler('Unit lesson not found!', 404));
    }

    // Xóa fillBlankExercise
    const fillBlankExercise = await FillBlankExercise.deleteOne({ unitLesson: unitId });

    // Nếu không xóa được chứng tỏ unitLessonId không có trong database
    if (!fillBlankExercise) {
        return next(new ErrorHandler('FillBlankExercise not found!', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Deleted unitLesson successfully',
    });
});

// # Delete Lesson And UnitLesson
export const deleteLessonAndUnitLesson = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    // Lấy lessonId và unitLesson Id từ thanh URL (tức query);
    const lessonId = req.query.lessonId as string;

    // Nếu không có 2 trường này trong URL thì trả về lỗi 400
    if (!lessonId || lessonId === '') {
        return next(new ErrorHandler('LessonId or unitLessonId cannot be left blank', 400));
    }

    // Xóa lesson với lessonId lấy từ URL
    const lesson = await Lesson.findByIdAndDelete(lessonId);

    // Nếu không tìm thấy thì trả về status 404
    if (!lesson) {
        return next(new ErrorHandler('Lesson not found', 404));
    }

    // Xóa tất cả các unitLesson có lessonId tương ứng
    const deleteUnitLessonResult = await UnitLesson.deleteMany({ lesson: lessonId });

    // Kiểm tra xem có bản ghi nào bị xóa không
    if (deleteUnitLessonResult.deletedCount === 0) {
        return next(new ErrorHandler('No unitLesson found for the given lessonId', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Delete lesson and unitLesson successfully',
    });
});
