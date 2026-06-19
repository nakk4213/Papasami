import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleName;
    } & DefaultSession["user"];
  }
}

function localDemoUser(email: string, password: string) {
  if (process.env.NODE_ENV === "production" || password !== "PapaSami@123") return null;
  if (email === "admin@papasamistudio.local") return { id: "local-admin", email, name: "Papa Sami Studio Admin", image: null, role: "ADMIN" as RoleName };
  if (email === "designer@papasamistudio.local") return { id: "local-designer", email, name: "Papa Sami Creative", image: null, role: "DESIGNER" as RoleName };
  if (email === "client@papasamistudio.local") return { id: "local-client", email, name: "Demo Client", image: null, role: "CLIENT" as RoleName };
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: process.env.NODE_ENV === "production" ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
          if (!user?.passwordHash || !user.isActive) return null;
          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
        } catch {
          return localDemoUser(parsed.data.email, parsed.data.password);
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            isActive: true
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            role: "CLIENT"
          }
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email && "role" in user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } }).catch(() => null);
        if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as RoleName;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
});
