import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// Fetch the user's current data
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, phone: true } // Grab the phone number!
    });

    if (!user) return new NextResponse('User not found', { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Save the updated settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone, // Save the new phone number!
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Settings update error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}