// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from "express";

export interface userDetailsType extends Request {
  user: {
    id: string;
  };
}

export type ControllerType = (
  req: userDetailsType,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;
