import mongoose, { Schema } from "mongoose";
import { IMessage } from "@/types";
import User from "./User";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["normal", "delayed"],
      default: "normal",
    },
    senderName: {
      type: String,
      default: "Anonymous",
    },
    content: {
      type: String,
      required: true,
    },
    unlockDate: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model("Message", messageSchema);
export default Message;
