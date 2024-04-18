// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from "../middleware/auth.js";
import {
  getAllCourses,
  getAllLessonsByCourseId,
  getAllUnitLesson,
  newCourse,
  newLesson,
  newUnitLesson,
} from "../controllers/courseController.js";

// config multer
const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: { fieldSize: 3e7 },
});

const uploadConfig = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([
    {
      name: "courseImage",
      maxCount: 1,
    },
    { name: "file", maxCount: 1 },
  ])(req, res, next);
};

// ##########################
const router: Router = express.Router();
router.get("/courses", getAllCourses);
router.get("/lessons/:id", getAllLessonsByCourseId);
router.get("/unitLessons/:id", getAllUnitLesson);

router.post("/new-course", isAuthenticated, uploadConfig, newCourse);
router.post("/new-lesson", isAuthenticated, newLesson);
router.post("/new-unitLesson", isAuthenticated, newUnitLesson);

export default router;
