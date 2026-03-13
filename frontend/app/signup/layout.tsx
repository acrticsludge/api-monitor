import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started Free",
  description:
    "Create a free Pulse account. Monitor up to 5 APIs with 5-minute checks, webhook alerts, and a public status page — no credit card required.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://pulsemonitor.dev/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
