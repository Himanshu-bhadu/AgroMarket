"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Push the user to the search page with their query in the URL
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto z-10">
      <div className="relative flex items-center w-full h-14 rounded-2xl focus-within:shadow-lg bg-white dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800 transition-shadow">
        <div className="grid place-items-center h-full w-12 text-gray-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          className="peer h-full w-full outline-none text-sm text-gray-900 dark:text-white bg-transparent pr-2"
          type="text"
          id="search"
          placeholder="Search for potatoes, tractors, seeds..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button 
          type="submit"
          className="h-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}