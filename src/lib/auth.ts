import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: { timeout: 15000 },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isMatch) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) token.id = dbUser._id.toString();
        } else {
          token.id = (user as { id: string }).id;
        }
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }
      const idStr = token.id ? String(token.id) : "";
      if (token.email && !/^[a-f0-9]{24}$/i.test(idStr)) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) token.id = dbUser._id.toString();
      }
      return token;
    },
    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          await connectDB();
          const existingUser = await User.findOne({ email: profile.email });
          if (!existingUser) {
            const password = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(password, 10);
            const created = await User.create({
              name: profile.name,
              email: profile.email,
              password: hashedPassword,
            });
            (profile as { id?: string }).id = created._id.toString();
          } else {
            (profile as { id?: string }).id = existingUser._id.toString();
          }
        }
        return true;
      } catch (error) {
        console.error("Error signing in", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
