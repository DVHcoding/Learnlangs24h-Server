// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from '../middleware/auth.js';
import {
    getAllCourses,
    getAllLessonsByCourseId,
    getAllUnitLessonByCourseId,
    getAllUnitLessonByLessonId,
    getFillBlankExercise,
    getUnitLessonById,
    getUnitLessonIdFromUserProcess,
    getUserProcessStatus,
    getVideoLectureContent,
    newCourse,
    newFillBlankExercise,
    newLesson,
    newUnitLessonAndFillBlankExercise,
    newUnitLessonAndVideoLectureContent,
    newUserProcessStatus,
    updateUnitLessonAndFillBlankExercise,
    updateUnitLessonAndVideoLectureContent,
    updateUserProcessStatus,
} from '../controllers/courseController.js';

// config multer
const upload = multer({
    dest: path.join(__dirname, '../uploads'),
    limits: { fieldSize: 3e7 },
});

const uploadConfig = (req: Request, res: Response, next: NextFunction) => {
    upload.fields([
        {
            name: 'courseImage',
            maxCount: 1,
        },
        { name: 'file', maxCount: 1 },
    ])(req, res, next);
};

// ##########################
const router: Router = express.Router();
// ########## GET ###########
router.get('/courses', getAllCourses);
router.get('/lessons/:id', getAllLessonsByCourseId);
router.get('/unitLessons/:id', getAllUnitLessonByCourseId);
router.get('/unitLessonsByLessonId/:id?', getAllUnitLessonByLessonId);
router.get('/unitLesson/:id', getUnitLessonById);
router.get('/videoLectureContent/:id', getVideoLectureContent);
router.get('/fillBlankExercise/:id', getFillBlankExercise);
router.get('/userProcessStatuses/:id', isAuthenticated, getUserProcessStatus);
router.get('/unitLessonIdByUserProcess', isAuthenticated, getUnitLessonIdFromUserProcess);

// ########## POST ###########
router.post('/new-course', isAuthenticated, uploadConfig, newCourse);
router.post('/new-lesson', isAuthenticated, newLesson);
router.post('/newUnitLessonAndVideoLectureContent', isAuthenticated, newUnitLessonAndVideoLectureContent);
router.post('/newUnitLessonAndFillBlankExercise', isAuthenticated, newUnitLessonAndFillBlankExercise);
router.post('/newFillBlankExercise', isAuthenticated, newFillBlankExercise);
router.post('/newUserProcessStatus', isAuthenticated, newUserProcessStatus);

// ########## PUT ###########
router.put('/updateUserProcessStatus', isAuthenticated, updateUserProcessStatus);
router.put('/updateUnitLessonAndVideoLectureContent', isAuthenticated, updateUnitLessonAndVideoLectureContent);
router.put('/updateUnitLessonAndFillBlankExercise', isAuthenticated, updateUnitLessonAndFillBlankExercise);

export default router;
