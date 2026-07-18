"use client";

import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Top gradient banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 pt-8 pb-12 text-center">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-2xl font-extrabold text-white">Unlock AI Kishan Pro</h2>
          <p className="text-amber-100 text-sm mt-1">You've used all your free questions</p>
        </div>

        {/* Content — overlaps the banner slightly */}
        <div className="px-8 pb-8 -mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-6">

            {/* Price */}
            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white">₹99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Less than ₹4 per day
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {[
                { icon: "🤖", text: "Unlimited AI Kishan questions" },
                { icon: "📸", text: "Crop disease photo diagnosis" },
                { icon: "📅", text: "Personalized planting calendar" },
                { icon: "📊", text: "Yield optimization reports" },
                { icon: "🌦️", text: "Region-based weather insights" },
                { icon: "⚡", text: "Priority response speed" },
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-base">{feature.icon}</span>
                  <span>{feature.text}</span>
                  <span className="ml-auto text-emerald-500 text-xs font-bold">✓</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              onClose();
              router.push("/pricing");
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-base"
          >
            Upgrade to Pro — ₹99/mo ⚡
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Maybe later
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}