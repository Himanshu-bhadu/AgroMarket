"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // UI State
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password Login State
  const [identifier, setIdentifier] = useState(""); // Can be Email OR Phone
  const [password, setPassword] = useState("");

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  // --- PASSWORD LOGIN SUBMIT ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); 
    
    try {
      const res = await signIn("credentials", {
        email: identifier, // We send 'identifier' but NextAuth expects the key to be named 'email'
        password,
        redirect: false, 
      });

      if (res?.error) {
        setError("Invalid credentials. Please check and try again.");
      } else if (res?.ok) {
        router.push("/");
        router.refresh(); 
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- REQUEST EMAIL OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      if (res.ok) {
        setOtpSent(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VERIFY OTP & LOGIN ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("email-otp", {
        email: otpEmail,
        code: otpCode,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid or expired OTP.");
      } else if (res?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Display Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-sm text-center dark:bg-red-900/20 dark:border-red-800">
            {error}
          </div>
        )}

        {/* --- LOGIN METHOD TABS --- */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setLoginMethod("password"); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              loginMethod === "password" 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod("otp"); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              loginMethod === "otp" 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Email OTP
          </button>
        </div>

        {/* --- FORM 1: PASSWORD LOGIN --- */}
        {loginMethod === "password" && (
          <form className="mt-4 space-y-6" onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address or Phone number
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                  placeholder="email address or phone number"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer dark:bg-gray-800 dark:border-gray-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-colors duration-200">
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* --- FORM 2: EMAIL OTP LOGIN --- */}
        {loginMethod === "otp" && (
          <div className="mt-4 space-y-6">
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label htmlFor="otpEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="otpEmail"
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="farmer@agrimarket.com"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 disabled:opacity-70 transition-colors">
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center border border-emerald-100 dark:border-emerald-800">
                  <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">Code sent to {otpEmail}</p>
                  <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-emerald-600 font-bold mt-1 underline">Change Email</button>
                </div>
                <div>
                  <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
                    Enter 6-digit Code
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    className="block w-full px-4 py-4 text-center text-2xl tracking-widest font-mono border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="••••••"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-colors">
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin} 
              disabled={isGoogleLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                "Redirecting to Google..."
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}