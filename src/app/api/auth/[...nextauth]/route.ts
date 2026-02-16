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
      allowDangerousEmailAccountLinking: true,
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
      if (user) {
        // MongoDBAdapter provides user.id, not user._id
        token._id = user.id;
        console.log("JWT callback - setting token._id:", user.id);
      }
      return token;
    },
    async session({ session, token }) {
      // Make the user ID and username available in the frontend session
      if (session.user && token._id) {
        (session.user as any)._id = token._id;
        console.log("Session callback - token._id:", token._id);
        
        // Fetch the username from the database
        try {
          await dbConnect();
          const user = await User.findById(token._id).select("username");
          if (user) {
            (session.user as any).username = user.username;
            console.log("Session callback - found username:", user.username);
          } else {
            console.log("Session callback - user not found with id:", token._id);
          }
        } catch (error) {
          console.log("Session callback - error fetching user:", error);
        }
      } else {
        console.log("Session callback - missing session.user or token._id:", { 
          hasSession: !!session.user, 
          hasTokenId: !!token._id 
        });
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
