"use client";

import { useState } from "react";
import Link from "next/link";
import GoogleTranslate from "./GoogleTranslate";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  label: string;
  href: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { data: session, status } = useSession();
  const { cartCount, setIsCartOpen } = useCart();

  const mainNavItems: NavItem[] = [
    { label: "Fruits", href: "/fruits" },
    { label: "Sell", href: "/sell" },
    { label: "Rent Equipment", href: "/rent" },
  ];

  const vegetableCategories = [
    { name: "Organic Leafy Greens", href: "/shop?category=Vegetables&q=leafy" },
    { name: "Root Vegetables", href: "/shop?category=Vegetables&q=root" },
    { name: "Seasonal Crops", href: "/shop?category=Vegetables&q=seasonal" },
    { name: "All Vegetables", href: "/shop?category=Vegetables" },
  ];

  const getInitials = (name: string | null | undefined) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LOGO --- */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black flex items-center gap-2 group">
              <span className="transform group-hover:scale-110 transition-transform duration-200">🌾</span>
              <span className="tracking-tight text-gray-900 dark:text-white">
                Agri<span className="text-emerald-600">Market</span>
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            
            {/* Vegetables Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button className="group flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-semibold transition-colors duration-200">
                Vegetables
                <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180 text-emerald-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown Menu (Animated) */}
              <div className={`absolute left-0 top-full pt-2 w-64 z-50 transition-all duration-200 origin-top-left ${showDropdown ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 overflow-hidden">
                  {vegetableCategories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={cat.href}
                      className="block px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Links */}
            {mainNavItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="relative text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-semibold transition-colors duration-200 group"
              >
                {item.label}
                {/* Hover Underline Effect */}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </Link>
            ))}

            {/* AI Kishan Badge */}
            <Link
              href="/ai-kishan"
              className="ml-2 relative group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5"
            >
              <span className="animate-pulse">✨</span> 
              AI Kishan
            </Link>
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className="hidden md:flex items-center space-x-3">
            <GoogleTranslate />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div> {/* Divider */}
            <ThemeToggle />
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-black text-white bg-emerald-600 rounded-full transform translate-x-1/3 -translate-y-1/3 border-2 border-white dark:border-gray-950 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Area */}
            {status === "loading" ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse ml-2"></div>
            ) : status === "authenticated" && session.user ? (
              <div 
                className="relative ml-2"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold border-2 border-transparent hover:border-emerald-500 transition-all focus:outline-none overflow-hidden ring-2 ring-transparent hover:ring-emerald-100 dark:hover:ring-emerald-900">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(session.user.name)
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className={`absolute right-0 top-full pt-2 w-56 z-50 transition-all duration-200 origin-top-right ${showProfileMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20 mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user.name}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    
                    <div className="p-1.5 space-y-0.5">
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                        👤 My Dashboard
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                        📦 My Orders
                      </Link>
                      {session?.user?.role === "FARMER" && (
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-500 rounded-xl bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                          🌾 Farmer Tools
                        </Link>
                      )}
                      <Link href="/profile/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        ⚙️ Settings
                      </Link>
                    </div>

                    <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        🚪 Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-2">
                <Link href="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
                <Link href="/sell" className="text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white px-4 py-2 rounded-xl transition-all duration-200">
                  Join as Farmer
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE HAMBURGER MENU --- */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={() => setIsCartOpen(true)} className="relative p-1 text-gray-600 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-emerald-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`md:hidden absolute w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-6 space-y-6 overflow-y-auto">
          
          {/* Mobile Profile Card */}
          {status === "authenticated" && session.user && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-800">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-lg font-black flex items-center justify-center shadow-inner overflow-hidden border border-emerald-200 dark:border-emerald-800">
                {session.user.image ? <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" /> : getInitials(session.user.name)}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">{session.user.name}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Links */}
          <div className="space-y-2">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-3">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {vegetableCategories.map((cat, idx) => (
                <Link key={idx} href={cat.href} className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:text-emerald-500 transition-colors" onClick={() => setIsOpen(false)}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1 border-t border-gray-100 dark:border-gray-800 pt-4">
            {mainNavItems.map((item, idx) => (
              <Link key={idx} href={item.href} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>

          <Link href="/ai-kishan" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md active:scale-95 transition-transform" onClick={() => setIsOpen(false)}>
            ✨ Ask AI Kishan
          </Link>

          {/* Mobile Auth Actions */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
            {status === "authenticated" ? (
              <>
                <Link href="/profile" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsOpen(false)}>
                  👤 My Dashboard
                </Link>
                <Link href="/orders" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsOpen(false)}>
                  📦 My Orders
                </Link>
                {session?.user?.role === "FARMER" && (
                  <Link href="/dashboard" className="block px-4 py-3 rounded-xl text-sm font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20" onClick={() => setIsOpen(false)}>
                    🌾 Farmer Dashboard
                  </Link>
                )}
                <button onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  🚪 Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" className="flex justify-center px-4 py-3 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link href="/sell" className="flex justify-center px-4 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white" onClick={() => setIsOpen(false)}>
                  Join Farmer
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}