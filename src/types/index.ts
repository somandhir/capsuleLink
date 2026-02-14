export type MessageType = "normal" | "delayed";

export interface IMessage {
  _id?: string;
  receiverId: string;
  type: MessageType;
  senderName: string;
  content: string;
  unlockDate?: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface ITestimonial {
  _id?: string;
  receiverId: string;
  product: string;
  senderName: string;
  content: string;
  videoUrl?: string;
  rating: number;
  createdAt: Date;
}

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  verificationCode: number;
  codeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  createdAt: Date;
}
