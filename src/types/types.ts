// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from 'express';

export interface userDetailsType extends Request {
    user: {
        id: string;
        username: string;
        email: string;
        googleId?: string;
    };
}

export type ControllerType = (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;

export interface CreateContentUnitLessonRequestType {
    videoUrl: string;
    totalTime: string;
    description: string;
    unitLesson: string;
}
