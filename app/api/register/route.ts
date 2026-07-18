import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Get the data from the frontend
    const body = await req.json();
    const { name, email, password, role ,phone} = body;

    // 2. Validate the data
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // 3. Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    // 4. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save the new user to the Neon database!
    // We convert the role to UPPERCASE because our Prisma enum expects "BUYER" or "FARMER"
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        phone:phone || null, 
      },
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}