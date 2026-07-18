import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// Fetch the product data to pre-fill the form
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update the product securely
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // SECURITY CHECK: Ensure this user actually owns this product
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return new NextResponse('Product not found', { status: 404 });
    }

    if (existingProduct.farmerId !== session.user.id) {
      return new NextResponse('Forbidden: You do not own this product', { status: 403 });
    }

    const body = await req.json();
    const { name, price, unit, category, listingType, description, stock, imageUrl } = body;

    // Update the database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: parseFloat(price),
        unit,
        category,
        listingType,
        description,
        stock: parseInt(stock),
        imageUrl,
      },
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("Error updating product:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}