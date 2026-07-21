import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer"; // 1. Import Nodemailer!

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // 2. Configure the Nodemailer Transporter
    console.log("Checking Env Variables:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "Password exists" : "Password missing!");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Define what the email looks like
    const mailOptions = {
      from: `"AgriMarket Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your AgriMarket Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #059669;">AgriMarket Password Reset</h2>
          <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
          <p style="color: #374151; font-size: 16px;">We received a request to reset your password. Click the button below to create a new one.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        </div>
      `,
    };

    // 4. Send the email!
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}