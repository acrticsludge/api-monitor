import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Pulse account to manage your API monitors, view uptime history, and access your public status page.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://pulsemonitor.dev/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
