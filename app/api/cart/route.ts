import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET: Fetch everything currently in the logged-in user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true, // Also fetch the product details (name, price, image)
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST: Add an item to the cart (or increase its quantity)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    // THE MAGIC UPSERT
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        quantity: { increment: quantity }, // If exists, add to quantity
      },
      create: {
        userId,
        productId,
        quantity, // If new, create it
      },
      include: {
        product: true,
      }
    });

    return NextResponse.json(cartItem, { status: 200 });
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json({ message: "Failed to add to cart" }, { status: 500 });
  }
}

// DELETE: Remove an item entirely from the cart
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Get the ID of the cart item from the URL (e.g., /api/cart?id=123)
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ message: "Cart Item ID required" }, { status: 400 });
    }

    // Delete it from the database (ensuring it belongs to the logged-in user for security)
    await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        userId: userId, 
      },
    });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete cart error:", error);
    return NextResponse.json({ message: "Failed to delete item" }, { status: 500 });
  }
}

// app/api/cart/route.ts

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");
    const { quantity } = await req.json();

    if (!cartItemId || quantity < 1) {
      return new Response("Invalid data", { status: 400 });
    }

    // Update the database with the new quantity
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return new Response("Updated", { status: 200 });
  } catch (error) {
    return new Response("Failed to update cart", { status: 500 });
  }
}