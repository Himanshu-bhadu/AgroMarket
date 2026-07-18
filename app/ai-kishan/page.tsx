"use client";

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import UpgradeModal from '@/components/UpgradeModal';
import { toast } from 'react-hot-toast';

const FREE_LIMIT = 3;

export default function AIKishanPage() {
  const { data: session } = useSession();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [localUsage, setLocalUsage] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false); // NEW STATE
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We add `setMessages` here so we can inject the history from the database!
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: () => {
      if (!isPro) setLocalUsage((prev) => prev + 1);
    },
    onError: (error: Error) => {
      if (error.message.includes('403')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Something went wrong connecting to AI Kishan. Please try again.');
      }
    },
  });

  // --- UPGRADED: Fetch both Usage limits AND Chat History ---
  useEffect(() => {
    const loadUserData = async () => {
      if (!session) {
        setUsageLoaded(true);
        setHistoryLoaded(true);
        return;
      }

      try {
        // 1. Fetch Limits
        const usageRes = await fetch('/api/ai-usage');
        if (usageRes.ok) {
          const data = await usageRes.json();
          setLocalUsage(data.aiQuestionsUsed ?? 0);
          setIsPro(data.isPro ?? false);
        }

        // 2. Fetch Chat History
        const historyRes = await fetch('/api/chat/history');
        if (historyRes.ok) {
          const pastMessages = await historyRes.json();
          // Map DB format to the format the AI SDK expects
          setMessages(pastMessages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content
          })));
        }
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setUsageLoaded(true);
        setHistoryLoaded(true);
      }
    };

    loadUserData();
  }, [session, setMessages]);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const questionsLeft = Math.max(0, FREE_LIMIT - localUsage);
  const isAtLimit = !isPro && localUsage >= FREE_LIMIT;

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }
    sendMessage({ text });
    setInputValue('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

          {/* Title */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center gap-2">
              ✨ AI Kishan
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Your 24/7 Expert Agricultural Assistant
            </p>
          </div>

          {/* ── FREE USER: usage bar + always-visible upgrade button ── */}
          {usageLoaded && !isPro && (
            <div className="flex-shrink-0 flex flex-col items-end gap-2">

              {/* Usage dots */}
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Free questions
                </span>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(FREE_LIMIT)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-6 rounded-full transition-all duration-300 ${
                        i < questionsLeft
                          ? 'bg-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                  <span
                    className={`text-xs font-bold ml-1 ${
                      questionsLeft === 0
                        ? 'text-red-500'
                        : questionsLeft === 1
                        ? 'text-amber-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {questionsLeft}/{FREE_LIMIT}
                  </span>
                </div>
              </div>

              {/* ✅ Always-visible upgrade button for free users */}
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-150"
              >
                ⚡ Upgrade to Pro
              </button>
            </div>
          )}

          {/* ── PRO USER: badge ── */}
          {usageLoaded && isPro && (
            <div className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <span className="text-amber-500 text-sm">⭐</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Pro Member
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Loading state for history */}
          {!historyLoaded && (
            <div className="flex items-center justify-center mt-16 text-emerald-600">
              <div className="animate-pulse font-medium">Loading chat history...</div>
            </div>
          )}

          {/* Welcome / empty state */}
          {historyLoaded && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-16 text-center space-y-4">
              <span className="text-6xl">👨🏽‍🌾</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Namaste! I am AI Kishan.
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything about crop rotation, pest control, soil health, or weather forecasts.
              </p>

              {/* Usage notice */}
              {usageLoaded && !isPro && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${
                    questionsLeft === 0
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <span>{questionsLeft === 0 ? '🔒' : '🎁'}</span>
                  <span>
                    {questionsLeft > 0
                      ? `You have ${questionsLeft} free question${questionsLeft > 1 ? 's' : ''} remaining this month.`
                      : "You've used all free questions. Upgrade to Pro for unlimited access!"}
                  </span>
                  {/* Inline upgrade nudge when at limit */}
                  {questionsLeft === 0 && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="ml-1 underline font-bold whitespace-nowrap hover:no-underline"
                    >
                      Upgrade now →
                    </button>
                  )}
                </div>
              )}

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                {[
                  'What crops grow best in sandy soil?',
                  'How to treat aphids on tomato plants?',
                  'When is the right time to use a cultivator?',
                  'Best fertilizer for wheat crops in Punjab?',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    disabled={isAtLimit || isLoading}
                    className="p-3 text-sm text-left border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 hover:border-emerald-200 dark:hover:border-gray-700 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {historyLoaded && messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                }`}
              >
                {m.role === 'assistant' && (
                  <span className="text-amber-500 font-bold text-xs mb-1 block">
                    AI KISHAN
                  </span>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.parts
                    ?.filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('') ?? m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          {isAtLimit ? (
            /* Paywall input replacement */
            <div
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center justify-between w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-full pl-6 pr-4 py-4 cursor-pointer hover:border-amber-400/60 transition-colors"
            >
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                🔒 Upgrade to Pro for unlimited questions...
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                Upgrade ⚡
              </span>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="relative flex items-center">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder="Ask AI Kishan about your farm..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </form>
          )}
          <p className="text-center text-[10px] text-gray-400 mt-3">
            AI Kishan can make mistakes. Consider verifying critical farming advice.
          </p>
        </div>
      </div>
    </div>
  );
}