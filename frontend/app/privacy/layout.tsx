import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Pulse Privacy Policy — how we collect, use, and protect your data. We store only what's needed: your email, monitored URLs, and ping results.",
  alternates: {
    canonical: "https://pulsemonitor.dev/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Pulse",
    description:
      "Pulse Privacy Policy — how we collect, use, and protect your data.",
    url: "https://pulsemonitor.dev/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
