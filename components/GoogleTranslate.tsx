"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi",   native: "हिंदी",    flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ",  flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी",    flag: "🇮🇳" },
  { code: "te", label: "Telugu",  native: "తెలుగు",   flag: "🇮🇳" },
  { code: "ta", label: "Tamil",   native: "தமிழ்",    flag: "🇮🇳" },
];

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Read current language from googtrans cookie on mount
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    if (match) {
      const found = LANGUAGES.find((l) => l.code === match[1]);
      if (found) setSelected(found);
    }

    // Initialize Google Translate widget (hidden — we drive it ourselves)
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,pa,mr,te,ta",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    // Kill the white banner strip
    const killBanner = () => {
      document.body.style.setProperty("top", "0px", "important");
      document.documentElement.style.setProperty("top", "0px", "important");
      const banner = document.querySelector<HTMLElement>("iframe.goog-te-banner-frame");
      if (banner) banner.style.setProperty("display", "none", "important");
    };

    const observer = new MutationObserver(killBanner);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
      subtree: true,
    });
    killBanner();
    const t = setTimeout(killBanner, 500);

    // Close dropdown on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      observer.disconnect();
      clearTimeout(t);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const changeLanguage = (lang: (typeof LANGUAGES)[0]) => {
    setSelected(lang);
    setOpen(false);

    if (lang.code === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      window.location.reload();
      return;
    }

    const cookieValue = `/en/${lang.code}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

    const trySelect = (attempts = 0) => {
      const select = document.querySelector<HTMLSelectElement>(
        "#google_translate_element select"
      );
      if (select) {
        select.value = lang.code;
        select.dispatchEvent(new Event("change"));
      } else if (attempts < 10) {
        setTimeout(() => trySelect(attempts + 1), 200);
      }
    };
    trySelect();

    setTimeout(() => window.location.reload(), 100);
  };

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame,
        .skiptranslate > iframe {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body, html {
          top: 0px !important;
          margin-top: 0px !important;
          position: static !important;
        }
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        #google_translate_element {
          display: none !important;
        }
      `}} />

      {/* Hidden Google Translate widget */}
      <div id="google_translate_element" />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      {/* Custom language picker — fully theme-aware */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors
            border border-gray-200 dark:border-white/10
            bg-gray-100 dark:bg-transparent
            hover:bg-gray-200 dark:hover:bg-white/5
            text-gray-700 dark:text-gray-200
          "
        >
          <span className="text-base">🌐</span>
          <span>{selected.code.toUpperCase()}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">▾</span>
        </button>

        {open && (
          <div className="
            absolute right-0 top-[calc(100%+8px)] w-48 rounded-xl overflow-hidden z-50 shadow-lg
            bg-white dark:bg-gray-800
            border border-gray-100 dark:border-gray-700
          ">
            {LANGUAGES.map((lang, i) => (
              <div key={lang.code}>
                {/* Divider after English */}
                {i === 1 && (
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                )}
                <button
                  onClick={() => changeLanguage(lang)}
                  className={`
                    w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors
                    ${selected.code === lang.code
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                  {selected.code === lang.code && (
                    <span className="ml-auto text-emerald-500 dark:text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}