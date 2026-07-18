import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import QuickAddButton from "@/components/QuickAddButton";
import SearchBar from "@/components/SearchBar";

// Force Next.js to fetch fresh data every time someone visits the homepage
export const dynamic = "force-dynamic";

// 1. Fetch real data from PostgreSQL
async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 6, // Show the 6 most recent listings
      orderBy: {
        createdAt: "desc", // Newest first
      },
      // Join the User table to get the Farmer's name!
      include: {
        farmer: {
          select: {
            name: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function HomePage() {
  // 2. Await the database call
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Fresh from the farm, <span className="text-emerald-600 dark:text-emerald-500">straight to you.</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 mb-3">
          Buy fresh produce, rent farming equipment, or join our community.
        </p>
        <SearchBar/>
      </div>

      {/* Product Grid Layout */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Listings</h2>
        <Link href="/shop" className="text-emerald-600 dark:text-emerald-500 font-medium hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
          View all &rarr;
        </Link>
      </div>

      {/* Empty State (If no products exist yet) */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-5xl mb-4 block">🌾</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No listings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Be the first farmer to list your products!</p>
        </div>
      ) : (
        /* Real Products Grid */
/* Real Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            // 1. WE WRAPPED THE WHOLE CARD IN A LINK HERE:
            <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
              <div 
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Product Image */}
                <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm uppercase tracking-wider">
                    {product.listingType}
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    {product.category}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Sold by: <span className="text-gray-700 dark:text-gray-300">{product.farmer?.name || "Unknown Farmer"}</span>
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-emerald-500 transition-colors">{product.name}</h3>
                  
                  {/* Description snippet */}
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">₹{product.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
                    </div>
                    
                    {/* 2. Your Quick Add Button (It won't trigger the Link because of e.preventDefault!) */}
                    <div className="relative z-10">
                      <QuickAddButton productId={product.id} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
    </div>
  );
}