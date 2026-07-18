"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {toast} from 'react-hot-toast';

export default function DeleteAccountButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (res.ok) {
        // Log the user out and redirect to the home page automatically
        await signOut({ callbackUrl: '/' });
      } else {
        toast.error("Something went wrong. Please try again.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-red-100 dark:border-red-900/30">
      <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">Danger Zone</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Once you delete your account, there is no going back. All of your data, farm details, and AI Kishan usage history will be permanently erased.
      </p>

      {!isConfirming ? (
        <button
          onClick={() => setIsConfirming(true)}
          className="px-4 py-2 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
        >
          Delete Account
        </button>
      ) : (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isDeleting ? "Deleting..." : "Yes, I am sure"}
          </button>
          <button
            onClick={() => setIsConfirming(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}