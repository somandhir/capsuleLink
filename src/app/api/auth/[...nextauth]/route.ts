import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt", // Use JWTs for sessions
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Here, NextAuth has already created/found the user in MongoDB via the adapter.
        // You can add logic here to mark them as verified immediately.
        return true;
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
