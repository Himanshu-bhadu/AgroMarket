"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti"; 

export default function CheckoutSuccessPage() {
  
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B'] 
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Thank you for your order. The seller has been notified and your items will be prepared for delivery shortly.
        </p>

        <div className="space-y-3">
          <Link href="/orders" className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm">
            View My Orders
          </Link>
          <Link href="/" className="block w-full py-3 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors border border-gray-200 dark:border-gray-700">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}