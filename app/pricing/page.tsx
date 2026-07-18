"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script"; // <-- NEW IMPORT
import { useState } from "react"; // <-- NEW IMPORT
import {toast} from "react-hot-toast";

const FREE_FEATURES = [
  "3 AI Kishan questions per month",
  "Browse marketplace listings",
  "Buy produce & equipment",
  "Rent farm equipment",
  "Basic product reviews",
];

const PRO_FEATURES = [
  "Unlimited AI Kishan questions",
  "Crop disease photo diagnosis",
  "Personalized planting calendar",
  "Yield optimization reports",
  "Region-based weather insights",
  "Priority response speed",
  "Early access to new features",
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const [isLoading, setIsLoading] = useState(false); // <-- NEW STATE

  const handleUpgrade = async () => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create a Razorpay order for ₹99 via your existing endpoint
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99 }), 
      });
      
      const order = await res.json();

      if (!order.id) {
        toast.error("Failed to initialize payment. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Configure Razorpay modal options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "AI Kishan Pro",
        description: "Unlimited Agricultural AI Access",
        order_id: order.id,
        
        handler: async function (response: any) {
          try {
            setIsLoading(true);

            // 3. Inform backend to flag account as Pro
            await fetch('/api/upgrade/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId: response.razorpay_payment_id 
              }),
            });

            // 4. Send user back to chat with a success flag to re-trigger context
            window.location.href = '/ai-kishan?upgraded=true';
            
          } catch (error) {
            console.error("Failed to unlock Pro account status", error);
            setIsLoading(false);
          }
        },
        prefill: {
          name: session?.user?.name || "Farmer",
          email: session?.user?.email || "test@example.com",
          contact: "9876543210", 
        },
        theme: {
          color: "#f59e0b", // Beautiful Amber accent to match AI Kishan branding
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Upgrade checkout pipeline failure:", error);
      toast.error("Something went wrong loading the payment gateway.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-300">
      {/* Load Razorpay dynamic script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
            Simple Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Grow smarter with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              AI Kishan Pro
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Get unlimited access to your personal AI farming expert. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Free</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get started for free</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-black text-gray-900 dark:text-white">₹0</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 mt-0.5">○</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-3 text-center border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {status === "authenticated" ? "Your current plan" : "Get started free"}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-amber-500/20 p-8 shadow-xl flex flex-col overflow-hidden">

            {/* Popular badge */}
            <div className="absolute top-0 right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-b-xl shadow-md">
              MOST POPULAR
            </div>

            {/* Subtle glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pro <span className="text-amber-400">✨</span>
              </h3>
              <p className="text-sm text-gray-400 mt-1">For serious farmers</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-black text-white">₹99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                ≈ ₹3.3/day — less than a cup of chai ☕
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PRO_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={user?.isPro || isLoading} // <-- HANDLES DISABLING VIA STATE NOW
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {user?.isPro
                ? "✓ Already Pro"
                : isLoading
                ? "Securing Gateway..."
                : status === "unauthenticated"
                ? "Sign up & Upgrade ⚡"
                : "Upgrade to Pro ⚡"}
            </button>

            {!user?.isPro && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Cancel anytime. No hidden fees.
              </p>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What happens when I use my 3 free questions?",
                a: "You can still browse the full marketplace, buy produce, and rent equipment. Only the AI Kishan chat gets paused until the next month or you upgrade.",
              },
              {
                q: "Can I cancel my Pro subscription anytime?",
                a: "Yes, completely. Cancel from your profile settings and you won't be charged next month. You keep Pro access until the end of your billing period.",
              },
              {
                q: "What payment methods are accepted?",
                a: "We accept UPI (GPay, PhonePe, Paytm), all major debit/credit cards, and NetBanking through Razorpay — the most trusted payment gateway in India.",
              },
              {
                q: "Is AI Kishan available in Hindi?",
                a: "Yes! You can ask questions in Hindi or any regional language. AI Kishan is built to understand and respond to Indian farmers in their preferred language.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.q}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div> 
    </div>
  );
}