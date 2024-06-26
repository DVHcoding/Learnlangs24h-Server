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

export type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void | Response<any, Record<string, any>>>;

export interface CreateUnitLessonAndVideoLectureContentRequestType {
    title: string;
    time: string;
    icon: string;
    lectureType: string;
    lesson: string;
    course: string;
    videoUrl: string;
    description: string;
    totalTime: string;
}

export interface CreateUnitLessonAndFillBlankExerciseRequestType {
    title: string;
    time: string;
    icon: string;
    lectureType: string;
    lesson: string;
    course: string;
    questions: QuestionType;
}

export interface UpdateUnitLessonAndVideoLectureContentType {
    _id: string;
    title: string;
    time: string;
    lesson: string;
    videoUrl: string;
    totalTime: string;
    description: string;
}

export interface UpdateUnitLessonAndFillBlankExerciseType {
    _id: string;
    title: string;
    time: string;
    lesson: string;
    questions: QuestionType[];
}

interface QuestionType {
    sentence: string;
    correctAnswer: string[];
    otherAnswer: string[];
}

// ##########################
export interface UserRequestType {
    username: string;
    email: string;
    password?: string;
    photo: {
        public_id: string;
        url: string;
    };
    googleId?: string;
}

export interface MessageResponse {
    content: string;
    _id: string;
    sender: Sender;
    chat: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface Sender {
    _id: string;
    name: string;
}

export interface NewMessagePayload {
    chatId: string;
    senderId: string;
    members: string[];
    message: string;
}

export interface MessageForDBType {
    content: string;
    sender: string;
    chat: string;
}
export interface CachedMessages {
    messages: MessageResponse[]; // Thay any bằng kiểu dữ liệu chính xác của messages nếu có
    totalPages: number;
}

export interface SeenMessagePayload extends Omit<NewMessagePayload, 'message'> {}

export interface StartTypingPayload extends SeenMessagePayload {}

export interface StopTypingPayload extends StartTypingPayload {}
