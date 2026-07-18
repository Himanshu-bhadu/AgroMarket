// app/lib/auth.ts
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    
    // --- PROVIDER 1: STANDARD EMAIL & PASSWORD ---
    CredentialsProvider({
      id: "credentials", // Explicitly naming it to prevent conflicts
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Allow login if the input matches EITHER their email OR their phone number
        const user = await prisma.user.findFirst({ 
          where: { 
            OR: [
              { email: credentials.email },
              { phone: credentials.email } 
            ]
          } 
        });
        if (!user || !user.password) return null;
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (isPasswordValid) return user;
        return null; 
      }
    }),

    // --- PROVIDER 2: PASSWORDLESS EMAIL OTP ---
    CredentialsProvider({
      id: "email-otp", // Unique ID for this specific flow
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error("Email and OTP code are required");
        }

        const safeEmail = credentials.email.toLowerCase();

        // 1. Fetch the OTP code from the database
        const otpRecord = await prisma.otpCode.findUnique({
          where: { email: safeEmail },
        });

        // 2. Validate the OTP code
        if (!otpRecord) throw new Error("No OTP requested for this email");
        if (otpRecord.code !== credentials.code) throw new Error("Invalid OTP code");
        if (new Date() > otpRecord.expiresAt) throw new Error("OTP has expired");

        // 3. OTP is valid! Clean it up immediately to prevent re-use attacks
        await prisma.otpCode.delete({ where: { email: safeEmail } });

        // 4. Retrieve the user or register them on-the-fly if they are brand new
        let user = await prisma.user.findUnique({
          where: { email: safeEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { 
              email: safeEmail,
              name: "New User", 
              role: "BUYER" // Set your default role here
            },
          });
        }

        return user;
      },
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  
  callbacks: {
    // 1. jwt() runs ONCE when the user logs in
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        
        // Fetch the role from the DB ONCE during login
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
          token.role = dbUser.role;
        } else {
          token.role = "BUYER"; // Default fallback
        }
      }
      
      // If the user updates their profile (like changing a role later)
      if (trigger === "update" && session?.role) {
        token.role = session.role;  
      }
      
      return token;
    },

    // 2. session() runs on EVERY page load using the cached token
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; 
        session.user.role = token.role as string; // Instantly grab it from the token!
      }
      return session;
    }
  }
};