"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";

export default function NotificationBell({ userId }: { userId: string }) {
  const [mounted, setMounted] = useState(false);
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } =
    usePushNotifications(userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted (avoid SSR mismatch) or if browser doesn't support push
  if (!mounted || !supported) return null;

  const isDenied = permission === "denied";

  return (
    <button
      onClick={() => {
        if (isDenied || loading) return;
        if (subscribed) {
          unsubscribe();
        } else {
          subscribe();
        }
      }}
      title={
        isDenied
          ? "Notifications blocked — enable in browser settings"
          : subscribed
            ? "Notifications on — click to disable"
            : "Enable push notifications"
      }
      disabled={loading}
      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150 ${
        isDenied
          ? "border-black/[0.06] dark:border-white/[0.06] text-neutral-300 dark:text-neutral-700 cursor-not-allowed bg-transparent"
          : subscribed
            ? "border-[#00cc6a]/30 dark:border-[#00d294]/30 text-[#00cc6a] dark:text-[#00d294] bg-[#00cc6a]/[0.06] dark:bg-[#00d294]/[0.06] hover:bg-[#00cc6a]/[0.1] dark:hover:bg-[#00d294]/[0.1]"
            : "border-black/[0.08] dark:border-white/[0.08] bg-transparent text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-neutral-800 dark:hover:text-white"
      }`}
    >
      {loading ? (
        // Spinner
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : isDenied ? (
        // Bell with slash — blocked
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.707 18.707L5.293 5.293M9.17 4.343A6 6 0 0118 10c0 2.386-.38 4.184-1 5.546M6 10c0-1.06.274-2.057.756-2.921M4 13c-.213.62-.432 1.271-.595 1.936L4 17h10M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ) : subscribed ? (
        // Bell filled — active
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ) : (
        // Bell outline — inactive
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
    </button>
  );
}
