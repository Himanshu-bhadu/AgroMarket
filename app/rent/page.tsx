import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // 1. Set as Promise
}) {
  // 2. Await the parameters before using them
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";

  // 1. Build the query: ONLY fetch "RENT" items
  const whereClause: any = {
    listingType: "RENT", 
  };
  
  if (searchQuery) {
    whereClause.name = {
      contains: searchQuery,
      mode: "insensitive",
    };
  }

  // 2. Fetch from database
  const equipment = await prisma.product.findMany({
    where: whereClause,
    include: { farmer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-amber-50/30 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-amber-500 p-8 sm:p-10 rounded-3xl shadow-md text-white mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Rent Heavy Equipment</h1>
          <p className="text-amber-100 mb-6">Need a tractor for a day? Rent directly from local farmers and save money.</p>
          
          <form action="/rent" method="GET" className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="flex-grow relative">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search tractors, harvesters, tools..."
                className="w-full px-4 py-3 bg-white border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-300 focus:outline-none placeholder-gray-400"
              />
            </div>
            <button type="submit" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors shadow-sm">
              Find Equipment
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Found <span className="font-bold text-gray-900 dark:text-white">{equipment.length}</span> items available for rent.
          </p>
        </div>

        {/* Products Grid */}
        {equipment.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-5xl mb-4 block">🚜</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No equipment found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later or try adjusting your search.</p>
            <Link href="/rent" className="mt-6 inline-block text-amber-600 font-medium hover:underline">Clear Search</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipment.map((item) => (
              // 3. Added Link wrapper to make cards clickable
              <Link href={`/product/${item.id}`} key={item.id} className="group cursor-pointer">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
                      FOR RENT
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                      Owner: {item.farmer?.name || "Unknown"}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500">₹{item.price}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">/{item.unit}</span>
                      </div>
                      
                      <div className="relative z-10">
                        <button className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm">
                          Rent Now
                        </button>
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