import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewForm from "@/components/ReviewForm"; 
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      farmer: { select: { name: true, email: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!product) {
    notFound();
  }

  const totalReviews = product.reviews.length;
  const averageRating = totalReviews > 0 
    ? (product.reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1) 
    : "No ratings yet";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        
        {/* TOP SECTION: Product Details */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row mb-8">
          
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-[500px] bg-gray-100 dark:bg-gray-800">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              {product.category}
            </div>
          </div>

          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-2 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${product.listingType === "RENT" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500"}`}>
                {product.listingType === "RENT" ? "For Rent" : "For Sale"}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                ⭐ {averageRating} <span className="text-gray-400 text-sm font-normal">({totalReviews})</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-500">₹{product.price}</span>
              <span className="text-lg text-gray-500 dark:text-gray-400">/ {product.unit}</span>
            </div>

            <div className="prose dark:prose-invert mb-8 flex-grow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided by the farmer."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xl font-bold text-emerald-700 dark:text-emerald-500">
                {product.farmer?.name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Listed by</p>
                <p className="font-bold text-gray-900 dark:text-white">{product.farmer?.name || "Unknown Farmer"}</p>
              </div>
            </div>

            {/* --- NEW STOCK UI LOGIC --- */}
            <div className="mt-auto">
              {product.stock > 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock: {product.stock} {product.unit} available
                  </p>
                  <AddToCartButton product={{ id: product.id, name: product.name }} />
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-red-600 dark:text-red-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Out of Stock
                  </p>
                  <button 
                    disabled 
                    className="w-full py-3 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl font-bold cursor-not-allowed border border-gray-300 dark:border-gray-700"
                  >
                    Currently Unavailable
                  </button>
                </>
              )}
            </div>
            {/* -------------------------- */}

          </div>
        </div>

        {/* BOTTOM SECTION: Reviews List & Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
          
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                      {review.user.image ? <img src={review.user.image} alt="User" className="h-full w-full object-cover" /> : review.user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{review.user.name}</p>
                      <div className="flex text-amber-400 text-sm">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm ml-13 pl-13">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <ReviewForm productId={product.id} />
        </div>

      </div>
    </div>
  );
}