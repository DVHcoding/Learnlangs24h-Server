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
import cloudinary from "../config/cloudinary.js";

// ##########################

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
