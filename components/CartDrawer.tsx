"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, cartCount, removeFromCart, updateQuantity } = useCart();

  if (!isCartOpen) return null;

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              Your Cart <span>({cartCount})</span>
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>

          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <span className="text-5xl mb-3">🛒</span>
                <p className="font-medium text-gray-900 dark:text-white">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add items from the marketplace to get started.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-700" />
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">{item.product.name}</h4>
                      
                      
                      <div className="flex items-center mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-max bg-white dark:bg-gray-900">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors font-semibold text-sm"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                      {/* The Total Price for this line item */}
                      <div className="flex items-baseline gap-1">
                        <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{item.product.price * item.quantity}
                        </p>
                        {/* Only show the slash-unit next to the big number IF they only have 1 */}
                        {item.quantity === 1 && (
                          <span className="text-[10px] text-gray-400">/ {item.product.unit}</span>
                        )}
                      </div>
                      
                      {/* If they have more than 1, show the math underneath so they don't get confused! */}
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          (₹{item.product.price} / {item.product.unit})
                        </span>
                      )}
                    </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        title="Remove item entirely"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal Amount</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">₹{totalPrice.toFixed(2)}</span>
              </div>
              <Link 
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center block shadow-md transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}