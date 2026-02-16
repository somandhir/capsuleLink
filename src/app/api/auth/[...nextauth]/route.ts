import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt", 
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        await dbConnect();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const baseUsername = user.email.split("@")[0];

          let username = baseUsername;
          let counter = 1;

          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          await User.create({
            username,
            email: user.email,
            isVerified: true,
            isAcceptingMessage: true,
          });
        } else {
          if (!existingUser.isVerified) {
            existingUser.isVerified = true;
            await existingUser.save();
          }
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // The first time a user signs in, we can attach our custom data to the NextAuth JWT
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Make the user ID available in the frontend session
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
