import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import DeleteProductButton from "@/components/DeleteProductButton";


export default async function FarmerDashboard() {
  // 1. Get the currently logged-in user
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login"); // Kick them out if not logged in
  }

  // 2. Find the user in the database to get their ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return <div>User not found</div>;

  // 3. Fetch ONLY the products listed by this specific farmer
  const myProducts = await prisma.product.findMany({
    where: { farmerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Farmer Dashboard</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your listings, edit prices, or remove items.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/dashboard/orders" className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium shadow-sm transition-colors">
              📦 View Orders
            </Link>
            <Link href="/sell" className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm transition-colors">
              + Add New Product
            </Link>
          </div>
        </div>

        {myProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-medium">You haven't listed anything yet!</h3>
            <p className="text-gray-500 mt-2">Start selling vegetables, fruits, or renting out equipment today.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {myProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 relative rounded-md overflow-hidden">
                          <Image src={product.imageUrl || "/placeholder.jpg"} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.listingType === 'RENT' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {product.listingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ₹{product.price} <span className="text-gray-500 font-normal">/{product.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {/* These links will need actual routes built for them later! */}
                      <Link href={`/dashboard/edit/${product.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Edit
                      </Link>
                        <DeleteProductButton productId={product.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}