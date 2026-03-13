import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "Start monitoring your APIs for free. 5 monitors, 5-minute checks, webhooks, and public status pages — no credit card required. Upgrade to Pro for unlimited monitors and 1-minute intervals.",
  alternates: {
    canonical: "https://pulsemonitor.dev/pricing",
  },
  openGraph: {
    title: "Pricing — Free & Pro Plans | Pulse",
    description:
      "Start monitoring your APIs for free. No credit card required. Upgrade to Pro for unlimited monitors, 1-minute checks, and email alerts.",
    url: "https://pulsemonitor.dev/pricing",
  },
  twitter: {
    title: "Pricing — Free & Pro Plans | Pulse",
    description:
      "Start monitoring your APIs for free. No credit card required. Upgrade to Pro for unlimited monitors, 1-minute checks, and email alerts.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
