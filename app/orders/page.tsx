import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth"; 
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch the order, the items, the product, AND the farmer!
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              farmer: true, 
            }
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-emerald-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View your past purchases and contact sellers for coordination.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
            <span className="text-5xl mb-4 block">📦</span>
            <h3 className="text-xl font-bold">No orders yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Looks like you haven't bought or rented anything yet.</p>
            <Link href="/shop" className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Order Placed</span>
                    <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Total</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full mb-2 ${
                      (order.status === 'PAID' || order.status === 'SUCCESS') 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {order.status}
                    </span>
                    <br />
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Order ID</span>
                    <span className="font-mono text-xs">{order.id.toUpperCase()}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 pt-6 first:pt-0">
                      
                      <div className="relative h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                        <Image src={item.product.imageUrl || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        
                        {/* --- UPGRADED: Flex container for Title/Qty and Delivery Status --- */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link href={`/product/${item.product.id}`} className="text-lg font-bold hover:text-emerald-600 transition-colors">
                              {item.product.name}
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          
                          {/* --- NEW: Delivery Status Badge --- */}
                          <div>
                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${
                              item.deliveryStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' :
                              item.deliveryStatus === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' :
                              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'
                            }`}>
                              {item.deliveryStatus === 'DISPATCHED' ? '🚚 Dispatched' : 
                               item.deliveryStatus === 'DELIVERED' ? '✅ Delivered' : 
                               '⏳ Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Seller Contact Info */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Seller Details</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.product.farmer?.name || "Unknown Seller"}</p>
                          
                          {item.product.farmer?.phone ? (
                            <a href={`tel:+91${item.product.farmer.phone}`} className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 transition-colors w-fit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              +91 {item.product.farmer.phone}
                            </a>
                          ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">No phone number provided</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="sm:self-center mt-4 sm:mt-0">
                        <Link href={`/product/${item.productId}`} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-block text-center w-full sm:w-auto">
                          View Product
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}