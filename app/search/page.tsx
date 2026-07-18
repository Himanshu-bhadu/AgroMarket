import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  // Ask Prisma to find products where the name OR category matches the search term
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
      // Optional: Only show items that are actually in stock!
      stock: { gt: 0 } 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Put the search bar at the top so they can search again easily */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
            Search Results for "{query}"
          </h1>
          <SearchBar />
        </div>

        {products.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-900 p-12 rounded-3xl border border-gray-100 dark:border-gray-800">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">We couldn't find anything matching "{query}". Try searching for something else.</p>
            <Link href="/" className="text-emerald-600 font-bold hover:underline">
              Go back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image src={product.imageUrl || "/placeholder.jpg"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">
                    {product.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-auto pt-4">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-500">₹{product.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
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