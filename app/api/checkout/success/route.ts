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

    const userId = session.user.id;
    const body = await req.json();
    const { paymentId } = body;

    // 1. Fetch the user's current cart items so we know what they are buying
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return new NextResponse('Cart is empty', { status: 400 });
    }

    // 2. Calculate the exact total securely on the backend
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const totalAmount = subtotal + tax;

    // 3. Create the permanent Order and OrderItems in the database!
    await prisma.order.create({
      data: {
        userId: userId,
        totalAmount: totalAmount,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          }))
        }
      }
    });

    // --- NEW INVENTORY LOGIC ---
    // Deduct the purchased quantity from the farmer's available stock!
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }
    // ---------------------------

    // 4. Now that the order is safely stored, clear the user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: userId }
    });

    return NextResponse.json({ success: true, message: "Order placed successfully!" });

  } catch (error) {
    console.error("Checkout Success Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}