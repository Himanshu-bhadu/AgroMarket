"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast"; // --- NEW IMPORT ---

export default function EditProductPage() {
  const { id: productId } = useParams();
  const { status } = useSession();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "kg",
    category: "Vegetables",
    listingType: "SELL",
    description: "",
    imageUrl: "", 
    imageId: "", 
    stock: "" as any, 
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name,
            price: data.price.toString(),
            unit: data.unit,
            category: data.category,
            listingType: data.listingType,
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            imageId: "", 
            stock: data.stock,
          });
        } else {
          toast.error("Failed to load product. It may have been deleted.");
          router.push("/dashboard"); // Kick them back if the product is gone
        }
      } catch (err) {
        toast.error("Error fetching data.");
      } finally {
        setIsFetching(false);
      }
    };

    if (status === "authenticated" && productId) {
      fetchProduct();
    }
  }, [productId, status, router]);

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
      toast.error("Please provide an image of your product.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Product updated successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update product.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isFetching) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">Loading product data...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-emerald-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Listing</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your pricing, stock availability, photo, or description.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* --- SMART DYNAMIC CATEGORY LOGIC (Synced with Sell Page) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const newListingType = newCategory === "Equipment" ? formData.listingType : "SELL";
                    
                    let newUnit = formData.unit;
                    if (newCategory === "Equipment" && newListingType === "RENT") newUnit = "per day";
                    else if (newCategory === "Equipment" && newListingType === "SELL") newUnit = "piece";
                    else if (newCategory !== "Equipment" && (formData.unit.includes("per ") || formData.unit === "piece")) newUnit = "kg";

                    setFormData({ ...formData, category: newCategory, listingType: newListingType, unit: newUnit });
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              {formData.category === "Equipment" ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Listing Type</label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: "SELL", unit: "piece" })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        formData.listingType === "SELL" 
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: "RENT", unit: "per day" })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        formData.listingType === "RENT" 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
            {/* ------------------------------------------------------------- */}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Title</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Stock Left</label>
                <input type="number" name="stock" required min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value === "" ? "" as any : parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea 
                name="description" 
                rows={8} 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-y min-h-[150px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
              <p className="text-xs text-gray-400 mt-2 text-right">You can drag the bottom corner to make this box larger.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Photo</label>
              
              {formData.imageUrl && (
                <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 bg-gray-100">
                  <img src={formData.imageUrl} alt="Uploaded preview" className="object-contain w-full h-full" />
                  <button 
                    type="button" 
                    onClick={async () => {
                      const oldId = formData.imageId;
                      setFormData((prev) => ({ ...prev, imageUrl: "", imageId: "" }));
                      if (oldId) {
                        try {
                          await fetch('/api/upload/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ publicId: oldId }),
                          });
                        } catch (e) {
                          console.error("Failed to delete orphaned image");
                        }
                      }
                    }}
                    className="absolute top-3 right-3 bg-white/95 text-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-50 hover:shadow-lg transition-all"
                  >
                    🗑️ Remove & Change Photo
                  </button>
                </div>
              )}

              <div className={formData.imageUrl ? "hidden" : "block animate-in fade-in duration-300"}>
                <CldUploadWidget 
                  uploadPreset="agrimarket_products" 
                  onSuccess={(result: any) => {
                    setFormData((prev) => ({ ...prev, imageUrl: result.info.secure_url, imageId: result.info.public_id }));
                    document.body.style.overflow = "unset";
                  }}
                  onClose={() => { document.body.style.overflow = "unset"; }}
                >
                  {({ open }) => {
                    return (
                      <button 
                        type="button" 
                        onClick={() => open()} 
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <svg className="w-12 h-12 mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          <span className="text-base font-bold text-gray-900 dark:text-white mb-1">Upload a new photo</span>
                          <span className="text-sm">Click to browse your files</span>
                        </div>
                      </button>
                    );
                  }}
                </CldUploadWidget>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 mt-8">
              <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}