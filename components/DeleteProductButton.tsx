"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh(); // Instantly removes the row from the table!
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}