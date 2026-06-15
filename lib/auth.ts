import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import * as argon2 from "argon2";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        // Only allow verified users to login
        if (!user.emailVerified) return null;

        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") {
        // Create profile if first OAuth login
        if (user.id) {
          const profile = await db.userProfile.findUnique({
            where: { userId: user.id },
          });
          if (!profile) {
            await db.userProfile.create({
              data: { userId: user.id },
            });
          }
        }
        return true;
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create default profile for new users
      if (user.id) {
        await db.userProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      }
    },
  },
});
