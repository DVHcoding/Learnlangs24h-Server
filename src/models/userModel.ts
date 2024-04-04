// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ###############################
export interface UserType extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  photo: {
    public_id: string;
    url: string;
  };
  createdAt: Date;
  roles: string;
  googleId: string;
  resetPasswordCode: string;
  resetPasswordExpire: Date;
  refreshToken: string;
}

export interface UserDocument extends UserType, mongoose.Document {
  getJWTToken(): string;
  generateRefreshToken(): Promise<string>;
  comparePassword(enterPassword: string): Promise<boolean>;
}

// ##############################
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: [true, "Email already Exist"],
    validate: [validator.isEmail, "Please Enter Valid Email"],
  },
  password: {
    type: String,
    select: false,
  },
  photo: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  roles: {
    type: String,
    default: "user",
  },
  googleId: {
    type: String,
    unique: true,
    select: false,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  resetPasswordCode: String,
  resetPasswordExpire: Date,
});

// ###################################
// #  Mã hóa password trước khi lưu  #
// ###################################
userSchema.pre(
  "save",
  async function (
    this: UserType,
    next: mongoose.CallbackWithoutResultAndOptionalError
  ) {
    if (!this.isModified("password")) {
      next();
    }

    this.password = await bcrypt.hash(this.password, 10);
  }
);

// ##########################
// #       JWT TOKEN        #
// ##########################
userSchema.methods.getJWTToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET!, // Chuỗi bí mật JWT từ biến môi trường
    {
      expiresIn: process.env.JWT_EXPIRE, // Thời gian hết hạn của JWT từ biến môi trường
    }
  );
};

// ##########################
// #     REFRESH TOKEN      #
// ##########################
userSchema.methods.generateRefreshToken = async function (
  this: UserType
): Promise<string> {
  const refreshToken: string = crypto.randomBytes(20).toString("hex");
  this.refreshToken = refreshToken;
  await this.save();
  return refreshToken;
};

// ##########################
// #    COMPARE PASSWORD    #
// ##########################
userSchema.methods.comparePassword = async function (
  enterPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enterPassword, this.password);
};

const Users = mongoose.model<UserDocument>("Users", userSchema);
export default Users;
