"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import {toast} from "react-hot-toast";

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "kg",
    category: "Vegetables",
    listingType: "SELL",
    description: "",
    imageUrl: "", 
    stock: "", // <-- NEW: Added stock to state
  });

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      setError("Please upload an image of your product.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Product listed successfully!");
        router.push("/profile");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to list product.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">List a New Product</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Fill out the details below to sell your harvest or rent out your equipment.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Listing Type</label>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: "SELL", unit: formData.category === "Equipment" ? "piece" : "kg" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      formData.listingType === "SELL" 
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    Sell Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: "RENT", category: "Equipment", unit: "per day" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      formData.listingType === "RENT" 
                        ? "bg-amber-500 text-white shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    Rent Equipment
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const newUnit = (formData.listingType === "SELL" && newCategory === "Equipment") ? "piece" : formData.unit;
                    setFormData({ ...formData, category: newCategory, unit: newUnit });
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Title</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.listingType === "SELL" ? "e.g., Organic Red Tomatoes" : "e.g., Mahindra Tractor 575 DI"}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* --- NEW 3-COLUMN GRID FOR PRICE, UNIT, AND STOCK --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {formData.listingType === "RENT" ? (
                    <>
                      <option value="per hour">per Hour</option>
                      <option value="per day">per Day</option>
                      <option value="per week">per Week</option>
                    </>
                  ) : formData.category === "Equipment" ? (
                    <>
                      <option value="piece">per Piece</option>
                    </>
                  ) : (
                    <>
                      <option value="kg">per Kg</option>
                      <option value="ton">per Ton</option>
                      <option value="bundle">per Bundle</option>
                      <option value="piece">per Piece</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Quantity</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value === "" ? "" as any : parseInt(e.target.value)  })}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product's quality, age of equipment, etc..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Photo</label>
              
              {/* 1. Show the uploaded image if it exists */}
              {formData.imageUrl && (
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
                  <img src={formData.imageUrl} alt="Uploaded preview" className="object-cover w-full h-full" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* 2. Keep the widget in the code, but hide it if we have an image */}
{/* 2. Keep the widget in the code, but hide it if we have an image */}
              <div className={formData.imageUrl ? "hidden" : "block"}>
                <CldUploadWidget 
                  uploadPreset="agrimarket_products" 
                  onSuccess={(result: any) => {
                    setFormData((prev) => ({ 
                      ...prev, 
                      imageUrl: result.info.secure_url,
                      imageId: result.info.public_id // (Keeping this from the deletion step!)
                    }));
                    // --- THE FIX: FORCE UNLOCK SCROLLBAR ON SUCCESS ---
                    document.body.style.overflow = "unset";
                  }}
                  onClose={() => {
                    // --- THE FIX: FORCE UNLOCK SCROLLBAR IF THEY CANCEL ---
                    document.body.style.overflow = "unset";
                  }}
                >
                  {({ open }) => {
                    return (
                      <button 
                        type="button" 
                        onClick={() => open()} 
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span className="text-sm font-medium">Click to upload an image</span>
                        </div>
                      </button>
                    );
                  }}
                </CldUploadWidget>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
              <Link href="/profile" className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all shadow-sm"
              >
                {isLoading ? "Publishing..." : "Publish Listing"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}