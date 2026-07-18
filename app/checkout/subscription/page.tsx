"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {toast} from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any; 
  }
}

export default function SubscriptionCheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setIsLoading(true);

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Please check your internet connection.");
      setIsLoading(false);
      return;
    }

    // 2. Create order on our backend
    const res = await fetch("/api/subscription/create", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not initiate payment. Please try again.");
      setIsLoading(false);
      return;
    }

    const { orderId, amount, currency, keyId, userName, userEmail } =
      await res.json();

    // 3. Open Razorpay modal
    const options = {
      key: keyId,
      amount,
      currency,
      name: "AgriMarket",
      description: "AI Kishan Pro — Monthly Subscription",
      image: "/favicon.ico",
      order_id: orderId,
      handler: async (response: any) => {
        // 4. Verify payment on backend
        const verifyRes = await fetch("/api/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        if (verifyRes.ok) {
          // 5. Success! Redirect to AI Kishan
          router.push("/ai-kisaan?upgraded=true");
        } else {
          toast.error("Payment verification failed. Contact support.");
        }
      },
      prefill: {
        name: userName ?? "",
        email: userEmail ?? "",
      },
      theme: {
        color: "#059669", // Emerald green matching your site
      },
      modal: {
        ondismiss: () => setIsLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">

        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Upgrade to AI Kishan Pro
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Unlimited questions, crop diagnosis, planting calendars, and more.
        </p>

        {/* Price */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5 mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-gray-900 dark:text-white">₹99</span>
            <span className="text-gray-400">/month</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Cancel anytime · No hidden fees
          </p>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 text-base"
        >
          {isLoading ? "Opening payment..." : "Pay ₹99 with Razorpay ⚡"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Secured by Razorpay · UPI, Cards, NetBanking accepted
        </p>
      </div>
    </div>
  );
}