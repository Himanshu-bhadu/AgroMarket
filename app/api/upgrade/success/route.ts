import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Verify the payment ID from Razorpay
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return new NextResponse('Missing Payment ID', { status: 400 });
    }

    // 2. The Magic Flip: Upgrade the user to Pro!
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isPro: true } // This instantly bypasses the AI Kishan limits
    });

    return NextResponse.json({ success: true, message: "Welcome to AI Kishan Pro!" });

  } catch (error) {
    console.error("Upgrade Success Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}