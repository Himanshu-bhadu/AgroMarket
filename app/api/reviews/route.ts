import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "You must be logged in to leave a review." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid rating or product." }, { status: 400 });
    }

    // Save the review to the database
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId,
      },
      include: {
        user: { select: { name: true, image: true } } // Return user info so we can display it instantly
      }
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ message: "Failed to submit review." }, { status: 500 });
  }
}