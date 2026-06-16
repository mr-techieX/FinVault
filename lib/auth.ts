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
  debug: true,
  logger: {
    error(code, ...message) {
      console.error("[NEXTAUTH_ERROR]", code, ...message);
    },
    warn(code, ...message) {
      console.warn("[NEXTAUTH_WARN]", code, ...message);
    },
    debug(code, ...message) {
      console.log("[NEXTAUTH_DEBUG]", code, ...message);
    },
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
    async signIn({ user, account, profile }) {
      console.log("[SIGNIN_CALLBACK] Provider:", account?.provider);
      console.log("[SIGNIN_CALLBACK] User:", JSON.stringify({ id: user.id, email: user.email, name: user.name }));
      console.log("[SIGNIN_CALLBACK] Account:", JSON.stringify(account));
      console.log("[SIGNIN_CALLBACK] Profile email_verified:", (profile as Record<string, unknown>)?.email_verified);

      try {
        // Allow OAuth without email verification
        if (account?.provider !== "credentials") {
          // Create profile if first OAuth login and user already exists in DB
          if (user.id) {
            const dbUser = await db.user.findUnique({
              where: { id: user.id },
            });
            console.log("[SIGNIN_CALLBACK] dbUser found:", !!dbUser);
            if (dbUser) {
              const profile = await db.userProfile.findUnique({
                where: { userId: user.id },
              });
              if (!profile) {
                await db.userProfile.create({
                  data: { userId: user.id },
                });
                console.log("[SIGNIN_CALLBACK] Created profile for user:", user.id);
              }
            }
          }
          console.log("[SIGNIN_CALLBACK] Returning true for OAuth");
          return true;
        }
        console.log("[SIGNIN_CALLBACK] Returning true for credentials");
        return true;
      } catch (error) {
        console.error("[SIGNIN_CALLBACK] ERROR:", error);
        return true; // Still allow sign-in even if profile creation fails
      }
    },
  },
  events: {
    async createUser({ user }) {
      console.log("[EVENT_CREATE_USER] Creating profile for:", user.id);
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
