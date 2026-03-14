import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const BASE_URL = "https://pulsemonitor.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pulse — Free API Uptime Monitor",
    template: "%s | Pulse",
  },
  description:
    "Monitor your APIs and get alerted instantly when something goes down. Free uptime monitoring with webhooks, status pages, and health scoring for developers.",
  keywords: [
    "uptime monitor",
    "API monitoring",
    "free uptime checker",
    "status page",
    "webhook alerts",
    "endpoint monitoring",
    "developer tools",
  ],
  authors: [{ name: "Pulse" }],
  creator: "Pulse",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Pulse",
    title: "Pulse — Free API Uptime Monitor",
    description:
      "Monitor your APIs and get alerted instantly when something goes down. Free uptime monitoring with webhooks and public status pages.",
    url: BASE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulse — Free API Uptime Monitor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Free API Uptime Monitor",
    description:
      "Monitor your APIs and get alerted instantly when something goes down. Free uptime monitoring with webhooks and public status pages.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "Zp52JvI0L79nRUCpzbY02TiXUvymszci4n6HP6o76QY",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Pulse",
      description: "Free API uptime monitoring for developers.",
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Pulse",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.svg`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "anubhavrai100@gmail.com",
        contactType: "customer support",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Pulse",
      url: BASE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan — 5 monitors, 5-minute checks",
      },
      description:
        "API uptime monitoring with webhooks, public status pages, and health scoring. Free for developers.",
      featureList: [
        "Uptime monitoring",
        "Webhook alerts",
        "Public status pages",
        "Health scoring",
        "Response time graphs",
        "Incident reports",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
