// ##########################
// #      IMPORT NPM        #
// ##########################
import { NextFunction, Request, Response } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################

// ##########################
interface usersType {
  avatar: {
    public_id: string;
    url: string;
  };
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  const users: usersType = {
    avatar: {
      public_id: "avatars/q7nmcgo8s8jxsqqcoihv",
      url: "http://res.cloudinary.com/dqckbavcy/image/upload/v1709663395/avatars/q7nmcgo8s8jxsqqcoihv.jpg",
    },
    id: "65e764a57383e146caa6a7fc",
    name: "dohung",
    email: "dohungdzdz3@gmail.com",
    role: "user",
    createdAt: "2024-03-05T18:29:57.029Z",
  };

  res.status(200).json({
    success: true,
    users,
  });
};
