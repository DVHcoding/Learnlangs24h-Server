// ##########################
// #      IMPORT NPM        #
// ##########################
import { Request, Response } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import Users from "../models/userModel.js";
import { TryCatch } from "../middleware/error.js";
import { userDetailsType } from "../types/types.js";

// Get Details User Controller
export const detailsUser = TryCatch(
  async (req: Request & { user?: userDetailsType["user"] }, res: Response) => {
    const user = await Users.findById(req.user?.id);

    res.status(200).json({
      success: true,
      user,
    });
  }
);
