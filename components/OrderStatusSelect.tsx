"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast";

export default function OrderStatusSelect({ 
  itemId, 
  currentStatus 
}: { 
  itemId: string, 
  currentStatus: string 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/order-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });

      if (res.ok) {
        router.refresh(); // Instantly updates the UI!
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer appearance-none pr-8 border shadow-sm transition-colors ${
          currentStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          currentStatus === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}
      >
        <option value="PENDING">Pending</option>
        <option value="DISPATCHED">Dispatched</option>
        <option value="DELIVERED">Delivered</option>
      </select>
      {/* Custom Dropdown Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}