import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

async function verifyFarmerOwnership(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.farmerId !== user.id) return null;

  return product;
}

// 1. GET: Fetch product data to pre-fill the edit form
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const product = await prisma.product.findUnique({ where: { id: resolvedParams.id } });
    if (!product) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 2. PUT: Save the edited data
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const existingProduct = await verifyFarmerOwnership(resolvedParams.id);
    
    if (!existingProduct) {
      return new NextResponse('Unauthorized or Product Not Found', { status: 403 });
    }

    const body = await req.json();
    const { name, price, unit, category, listingType, description, stock, imageUrl } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
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
    console.error("Update error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 3. DELETE: Remove the product entirely
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const existingProduct = await verifyFarmerOwnership(resolvedParams.id);
    
    if (!existingProduct) {
      return new NextResponse('Unauthorized or Product Not Found', { status: 403 });
    }

    await prisma.product.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}