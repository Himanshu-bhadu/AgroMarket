import { prisma } from "@/app/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function FruitsPage() {
  // Fetch ONLY products where the category is "Fruits"
  const products = await prisma.product.findMany({
    where: {
      category: "Fruits", // Make sure this matches the exact string in your Add Product form!
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10">
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">
            Marketplace
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fresh Fruits
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {products.length} {products.length === 1 ? "result" : "results"} found.
          </p>
        </div>

        {/* Empty State (If no fruits exist yet) */}
        {products.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No fruits found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Farmers haven't uploaded any fruits yet.
            </p>
            <div className="mt-6">
              <Link href="/sell" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Be the first to sell
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any) => (
              <div 
                key={product.id}
                className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    src={product.imageUrl || "/placeholder-image.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg tracking-wider text-white shadow-sm bg-emerald-600">
                    {product.listingType}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                    {product.description || "No description available."}
                  </p>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        /{product.unit}
                      </span>
                    </div>

                    <button className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-200 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

