"use client";

import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickAddButton({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  };

  return (
    <button 
      onClick={handleAddClick}
      disabled={isAdding}
      className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white p-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
      title="Add to cart"
    >
      {isAdding ? (
        // A tiny loading spinner
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        // The Shopping Cart Icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </button>
  );
}