"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script"; 
import { useState } from "react";
import { toast } from "react-hot-toast"; // --- NEW IMPORT ---

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity } = useCart(); 
  const [isLoading, setIsLoading] = useState(false);

  // We calculate the subtotal exactly the way you did it in your CartDrawer!
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST calculation
  const total = subtotal + tax;

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Ask our backend to create a Razorpay Order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      
      const order = await res.json();

      if (!order.id) {
        toast.error("Failed to initialize payment. Please try again."); // --- REPLACED ALERT ---
        setIsLoading(false);
        return;
      }

      // 2. Configure the Razorpay popup window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "AgriMarket",
        description: "Agricultural Supplies & Equipment",
        order_id: order.id,
        
        // --- NEW UPDATED HANDLER ---
        handler: async function (response: any) {
          try {
            // Keep the loading state active while we redirect
            setIsLoading(true);

            // 1. Tell the backend the payment succeeded and clear the cart
            await fetch('/api/checkout/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId: response.razorpay_payment_id 
              }),
            });

            // 2. Redirect to the Victory Lap page! 
            // We use window.location.href to force a hard refresh so the CartContext empties perfectly.
            window.location.href = '/checkout/success';
            
          } catch (error) {
            console.error("Failed to process order cleanup", error);
            setIsLoading(false);
          }
        },
        // ---------------------------

        prefill: {
          name: "Himanshu Bhadu", // We can dynamically pull this from session later
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#059669", // Matches your Emerald-600 theme
        },
      };

      // 3. Open the popup
      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed: " + response.error.description); // --- REPLACED ALERT ---
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong loading the payment gateway."); // --- REPLACED ALERT ---
      setIsLoading(false);
    }   
  };

  if (cart.length === 0) {  
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
          Go back to market
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white transition-colors duration-300">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Order Summary */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">Order Summary</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b border-gray-50 dark:border-gray-800/50 pb-4 last:border-0 last:pb-0">
                
                {/* Image */}
                <div className="relative h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.product.imageUrl || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" />
                </div>
                
                {/* Info (Name and Base Price) */}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg line-clamp-1">{item.product.name}</h4>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    ₹{item.product.price} <span className="text-xs">/ {item.product.unit}</span>
                  </div>
                </div>
                
                {/* Total Price, Quantity Controls & Delete */}
                <div className="flex flex-col items-end gap-3">
                  
                  {/* MULTIPLIED TOTAL (No Unit Label) */}
                  <div className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                    ₹{item.product.price * item.quantity}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* - / + Buttons */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors font-semibold"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold"
                      >
                        +
                      </button>
                    </div>

                    {/* Trash Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove item entirely"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Price Breakdown & Payment */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">Payment Details</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">GST (5%)</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all"
            >
              {isLoading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">Secure payment integration pending</p>
          </div>
        </div>

      </div>
    </div>
  );
}