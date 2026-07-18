import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function DELETE() {
  try {
    // 1. Verify the user is actually logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Optional Safety Catch: If a FARMER deletes their account, we need to delete their products first
    // because Prisma will throw an error if products are left without an owner.
    await prisma.product.deleteMany({
      where: { farmerId: userId }
    });

    // 2. Delete the user (Prisma will automatically Cascade delete their CartItems, Reviews, and Orders based on your schema!)
    await prisma.user.delete({
      where: { id: userId }
    });

    // 3. Return a success signal
    return NextResponse.json({ message: 'Account permanently deleted' });

  } catch (error) {
    console.error("Error deleting account:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}