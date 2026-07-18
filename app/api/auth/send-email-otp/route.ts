import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const safeEmail = email.toLowerCase();

    // 1. Generate a random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

    // 2. Save or update the OTP in the database
    await prisma.otpCode.upsert({
      where: { email: safeEmail },
      update: { code: otp, expiresAt },
      create: { email: safeEmail, code: otp, expiresAt },
    });

    // 3. Configure the Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Define what the email looks like
    const mailOptions = {
      from: `"AgriMarket Team" <${process.env.EMAIL_USER}>`,
      to: safeEmail,
      subject: "Your AgriMarket Login Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #059669; text-align: center;">AgriMarket Secure Login</h2>
          <p style="color: #374151; font-size: 16px;">Hello,</p>
          <p style="color: #374151; font-size: 16px;">Here is your one-time password (OTP) to log into your account:</p>
          
          <div style="text-align: center; margin: 30px 0; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes. If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    // 5. Send the email!
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email OTP Sent" }, { status: 200 });
  } catch (error) {
    console.error("Email OTP error:", error);
    return new NextResponse("Failed to send Email OTP", { status: 500 });
  }
}