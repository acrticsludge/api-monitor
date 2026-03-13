import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Pulse Terms of Service — your rights and responsibilities when using Pulse for API uptime monitoring.",
  alternates: {
    canonical: "https://pulsemonitor.dev/terms",
  },
  openGraph: {
    title: "Terms of Service | Pulse",
    description:
      "Pulse Terms of Service — your rights and responsibilities when using Pulse for API uptime monitoring.",
    url: "https://pulsemonitor.dev/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
