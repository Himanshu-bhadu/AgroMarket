import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export default async function FarmerOrdersPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return <div>User not found</div>;

  // Fetch all order items where the product belongs to this farmer
  const soldItems = await prisma.orderItem.findMany({
    where: {
      product: {
        farmerId: user.id
      }
    },
    include: {
      product: true,
      order: {
        include: {
          user: true // This automatically fetches the buyer's new phone number!
        }
      }
    },
    orderBy: {
      order: {
        createdAt: "desc"
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-emerald-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Orders Received</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track what buyers have ordered from you and their contact details.</p>
            </div>
          </div>
        </div>

        {/* --- Orders Table --- */}
        {soldItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400">When someone buys your products, they will appear right here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer Details</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Status</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {soldItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(item.order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* Product Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 relative rounded-md overflow-hidden bg-gray-100">
                            <Image src={item.product.imageUrl || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{item.product.name}</div>
                            <div className="text-xs text-gray-500">₹{item.product.price}/{item.product.unit}</div>
                          </div>
                        </div>
                      </td>

                      {/* --- UPGRADED: Buyer Details with Phone Number --- */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.order.user?.name || "Guest User"}</div>
                        <div className="text-sm text-gray-500 mb-1">{item.order.user?.email || "No email provided"}</div>
                        
                        {/* Only show the phone number if the buyer has added one in their settings! */}
                        {item.order.user?.phone && (
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 mt-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            +91 {item.order.user.phone}
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        {item.quantity}
                      </td>

                      {/* Earnings */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-emerald-600 dark:text-emerald-500">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>

                    {/* Delivery Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                    <OrderStatusSelect 
                        itemId={item.id} 
                        currentStatus={item.deliveryStatus || "PENDING"} 
                    />
                    </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}