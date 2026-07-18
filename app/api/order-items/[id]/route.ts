import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const resolvedParams = await params;
    const { deliveryStatus } = await req.json();

    // 1. Find the specific order item and include the product details
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: resolvedParams.id },
      include: { product: true }
    });

    if (!orderItem) return new NextResponse('Item not found', { status: 404 });

    // 2. Security Check: Does the logged-in farmer own the product in this order item?
    if (orderItem.product.farmerId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. Update the status
    const updatedItem = await prisma.orderItem.update({
      where: { id: resolvedParams.id },
      data: { deliveryStatus }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update delivery status:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}