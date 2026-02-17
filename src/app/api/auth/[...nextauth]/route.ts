import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        await dbConnect();
        try {
          const user = await User.findOne({
            $or: [
              { email: credentials?.identifier },
              { username: credentials?.identifier },
            ],
          });

          if (!user) throw new Error("No user found with this identifier");
          if (!user.isVerified) throw new Error("not verified");

          const isPasswordCorrect = await bcrypt.compare(
            credentials!.password,
            user.passwordHash!
          );

          if (!isPasswordCorrect) throw new Error("Incorrect password");

          return {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            isAcceptingMessage: user.isAcceptingMessage,
          };
        } catch (err: any) {
          throw new Error(err.message);
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          if (!user.email) {
            console.error("Google sign-in failed: No email provided by Google");
            return false;
          }

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const baseUsername = user.email.split("@")[0];
            let username = baseUsername;
            let counter = 1;

            // Handle username collisions
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter++}`;
            }

            const newUser: any = await User.create({
              username,
              email: user.email,
              isVerified: true,
              isAcceptingMessage: true,
              // ⚠️ Ensure 'passwordHash' isn't required in your Schema 
              // or pass an undefined value explicitly
            });

            (user as any)._id = newUser._id.toString();
            (user as any).username = newUser.username;
            (user as any).isAcceptingMessage = newUser.isAcceptingMessage;
          } else {
            (user as any)._id = existingUser._id.toString();
            (user as any).username = existingUser.username;
            (user as any).isAcceptingMessage = existingUser.isAcceptingMessage;
          }

          return true; // Successfully logged in
        } catch (error) {
          // 2. CHECK YOUR TERMINAL FOR THIS LOG
          console.error("DETAILED_SIGNIN_ERROR:", error);
          return false; // This triggers the 'AccessDenied' redirect
        }
      }

      // Allow credentials login to proceed
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as any)._id;
        token.username = (user as any).username;
        token.isAcceptingMessage = (user as any).isAcceptingMessage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any)._id = token._id;
        (session.user as any).username = token.username;
        (session.user as any).isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
