import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // If not logged in, return default free stats
    if (!session?.user?.id) {
      return NextResponse.json({ isPro: false, aiQuestionsUsed: 0 });
    }

    // Fetch exact stats from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true, aiQuestionsUsed: true },
    });

    return NextResponse.json({
      isPro: user?.isPro ?? false,
      aiQuestionsUsed: user?.aiQuestionsUsed ?? 0,
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json({ isPro: false, aiQuestionsUsed: 0 }, { status: 500 });
  }
}