import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Find the token in the database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // 2. Check if the token exists and hasn't expired
    if (!resetRecord || resetRecord.expires < new Date()) {
      return NextResponse.json({ message: "Token is invalid or has expired" }, { status: 400 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user's password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // 5. Delete the token so it can't be used again!
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}