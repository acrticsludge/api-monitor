import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Pulse — Free API Uptime Monitor",
  description:
    "Monitor your APIs and get alerted instantly when something goes down. Free uptime monitoring for developers.",
  keywords: "uptime monitor, API monitoring, free uptime checker",
  openGraph: {
    title: "Pulse — Free API Uptime Monitor",
    description:
      "Monitor your APIs and get alerted instantly when something goes down.",
    url: "https://api-monitor-seven.vercel.app",
  },
  verification: {
    google: "Zp52JvI0L79nRUCpzbY02TiXUvymszci4n6HP6o76QY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
