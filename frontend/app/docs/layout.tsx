import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to use Pulse to monitor your APIs. Covers getting started, adding monitors, webhook setup, public status pages, incident reports, and more.",
  alternates: {
    canonical: "https://pulsemonitor.dev/docs",
  },
  openGraph: {
    title: "Documentation | Pulse",
    description:
      "Learn how to use Pulse to monitor your APIs. Setup guides for monitors, webhooks, status pages, and incident reports.",
    url: "https://pulsemonitor.dev/docs",
  },
  twitter: {
    title: "Documentation | Pulse",
    description:
      "Learn how to use Pulse to monitor your APIs. Setup guides for monitors, webhooks, status pages, and incident reports.",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
