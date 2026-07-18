import { prisma } from "@/app/lib/prisma";
import QuickAddButton from "@/components/QuickAddButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Next.js passes URL parameters into the `searchParams` prop automatically!
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>; // 1. Set as Promise
}) {
  // 2. Await the parameters before using them
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const categoryFilter = resolvedParams.category || "";

  // Build the Prisma search condition dynamically
  const whereClause: any = {};
  
  if (searchQuery) {
    whereClause.name = {
      contains: searchQuery,
      mode: "insensitive", // Matches both uppercase and lowercase
    };
  }
  
  if (categoryFilter) {
    whereClause.category = categoryFilter;
  }

  // Fetch the filtered products from the database
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { farmer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Explore the Marketplace</h1>
          
          <form action="/shop" method="GET" className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search for tomatoes, tractors, seeds..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            
            {/* Category Filter */}
            <select
              name="category"
              defaultValue={categoryFilter}
              className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:w-48"
            >
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Seeds">Seeds</option>
              <option value="Equipment">Equipment</option>
            </select>
            
            <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm">
              Search
            </button>
          </form>
        </div>

        {/* Search Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Found <span className="font-bold text-gray-900 dark:text-white">{products.length}</span> {products.length === 1 ? "result" : "results"}
            {searchQuery && <span> for "<span className="text-emerald-600 dark:text-emerald-500">{searchQuery}</span>"</span>}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms or changing the category filter.</p>
            <Link href="/shop" className="mt-6 inline-block text-emerald-600 font-medium hover:underline">Clear Filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              // 3. Added Link wrapper to make cards clickable
              <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                      {product.farmer?.name || "Unknown Farmer"}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-500">₹{product.price}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">/{product.unit}</span>
                      </div>
                      
                      {/* Added relative z-10 so clicking the button doesn't trigger the Link */}
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
    </div>
  );
}