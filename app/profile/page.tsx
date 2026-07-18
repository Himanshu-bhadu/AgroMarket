import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const userRole = dbUser.role || "BUYER";
  const initials = dbUser.name ? dbUser.name.charAt(0).toUpperCase() : "U";

  let myProducts: any[] = [];
  let recentOrders: any[] = [];

  if (userRole === "FARMER") {
    myProducts = await prisma.product.findMany({
      where: { farmerId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
  } else {
    recentOrders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 3, 
      include: {
        items: true 
      }
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl font-bold text-emerald-600 dark:text-emerald-500 border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
            {dbUser.image ? <img src={dbUser.image} alt="Profile" className="h-full w-full object-cover" /> : initials}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{dbUser.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${userRole === "FARMER" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500"}`}>
                {userRole}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{dbUser.email}</p>
            
            {dbUser.phone && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +91 {dbUser.phone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <nav className="space-y-2">
                <Link href="/profile/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  ⚙️ Account Settings
                </Link>
                {userRole === "FARMER" && (
                  <Link href="/sell" className="block px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
                    ➕ Add New Product
                  </Link>
                )}
                {userRole !== "FARMER" && (
                  <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    📦 My Orders
                  </Link>
                )}
                <Link href="/api/auth/signout" className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4">
                  🚪 Log Out
                </Link>
              </nav>
            </div>
          </div>

          {/* Right Column: Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {userRole === "FARMER" ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Active Listings</h3>
                </div>
                
                {myProducts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <span className="text-4xl mb-2 block">🌾</span>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">No products listed yet</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Start selling your harvest directly to buyers.</p>
                    <Link href="/sell" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                      Create Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProducts.map((product) => (
                      <div key={product.id} className="flex gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                          <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">₹{product.price} / {product.unit}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase">{product.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              
              /* --- UPGRADED: BUYER VIEW WITH BETTER FORMATTING --- */
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                </div>
                
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <span className="text-4xl mb-2 block">🛒</span>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h4>
                    <Link href="/shop" className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      // 1. Smart Payment Check
                      const isPaid = ['PAID', 'SUCCESS', 'COMPLETED'].includes(order.status?.toUpperCase() || "");
                      
                      // 2. Grammar Check for items
                      const itemCount = order.items.length;
                      const itemText = itemCount === 1 ? "1 item" : `${itemCount} items`;

                      return (
                        <div key={order.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              {/* Better Order ID Format */}
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Order #{order.id.slice(-6).toUpperCase()}
                              </p>
                              
                              {/* Better Human-Readable Badges */}
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                                isPaid 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {isPaid ? '✅ Successful' : '⏳ Pending'}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {itemText}
                            </p>
                          </div>
                          
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500">₹{order.totalAmount.toFixed(2)}</p>
                            <Link href="/orders" className="inline-block text-xs text-gray-400 font-medium mt-1 hover:text-emerald-600 transition-colors">
                              View Details →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                    
                    <Link href="/orders" className="block w-full text-center py-3 mt-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors">
                      View Full Order History
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}