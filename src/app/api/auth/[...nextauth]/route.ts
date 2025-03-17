import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ เพิ่ม Custom Type ให้ NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true }, // ✅ ดึง Role ของ User
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role.name, // ✅ เพิ่ม Role ใน Object ที่ส่งคืน
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;  // ✅ เพิ่ม ID ใน session
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;  // ✅ เพิ่ม ID ใน token
        token.role = user.role;
      }
      return token;
    },
  },
  session: { strategy: "jwt" as const },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
