// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from "../middleware/auth.js";
import { newCourse } from "../controllers/courseController.js";
import { Request, Response, NextFunction } from "express-serve-static-core";

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
router.post("/new-course", isAuthenticated, uploadConfig, newCourse);

export default router;
