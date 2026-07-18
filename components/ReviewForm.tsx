"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "unauthenticated") {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 mb-3">Want to share your thoughts on this product?</p>
        <Link href="/login" className="text-emerald-600 font-bold hover:underline">Log in to write a review</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (res.ok) {
        setMessage("Review submitted successfully!");
        setRating(0);
        setComment("");
        router.refresh(); // This forces the Next.js server to fetch the new review instantly!
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to submit.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
      
      {/* Interactive Stars */}
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(rating)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 ${star <= (hover || rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"} transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think about this product?"
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none mb-4"
      ></textarea>

      {message && (
        <p className={`text-sm mb-4 ${message.includes("success") ? "text-emerald-600" : "text-red-500"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : "Post Review"}
      </button>
    </form>
  );
}