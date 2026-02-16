import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
      _id?: string;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    _id?: string;
    isVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    _id?: string;
    isVerified?: boolean;
  }
}