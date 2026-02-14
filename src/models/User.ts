import mongoose, { Schema } from "mongoose";
import { IUser } from "@/types";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    verificationCode: {
      type: Number,
    },
    codeExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
    },
    isAcceptingMessage: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
export default User;
