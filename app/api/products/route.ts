import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// GET: Fetch all products (for the marketplace listing)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: Create a new product listing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Not logged in' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'FARMER') {
      return NextResponse.json({ message: 'Only farmers can list products' }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, unit, category, listingType, description, imageUrl } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        unit,
        category,
        listingType,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
        farmerId: user.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}