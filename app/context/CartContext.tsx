"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import {toast} from "react-hot-toast";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
}

export interface CartItem {
  id: string;       
  quantity: number;
  productId: string;
  product: CartProduct; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>; // ADD THIS LINE
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession(); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Added state

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    } else if (status === "unauthenticated") {
      setCart([]); 
    }
  }, [status]);

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        await fetchCart(); 
        setIsCartOpen(true); // Automatically open the drawer when an item is added!
      } else {
        toast.error("Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart", error);
    }
  };
  const removeFromCart = async (cartItemId: string) => {
    try {
      // 1. Optimistically remove it from the screen instantly for a snappy UI
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));

      // 2. Tell the database to delete it
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        await fetchCart(); // If it failed, fetch the real cart to fix the UI
        toast.error("Failed to remove item.");
      }
    } catch (error) {
      console.error("Error removing item", error);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent going to 0 (use trash button for that)

    try {
      // 1. Optimistic UI Update: instantly change it on the screen so it feels incredibly fast
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // 2. Tell the database to update
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        await fetchCart(); // Revert UI if DB fails
        toast.error("Failed to update quantity.");
      }
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartCount, isCartOpen, setIsCartOpen, fetchCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}