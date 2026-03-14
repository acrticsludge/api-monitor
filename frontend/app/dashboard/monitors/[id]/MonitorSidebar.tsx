"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  FileText,
  Search,
  Clock,
  Shield,
  Settings,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  proOnly?: boolean;
}

interface Props {
  monitorId: string;
  isPro: boolean;
}

export default function MonitorSidebar({ monitorId, isPro }: Props) {
  const pathname = usePathname();
  const base = `/dashboard/monitors/${monitorId}`;

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: base,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Response Time",
      href: `${base}/graphs`,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "Incidents",
      href: `${base}/incidents`,
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      label: "Reports",
      href: `${base}/reports`,
      icon: <FileText className="w-4 h-4" />,
      proOnly: true,
    },
    {
      label: "Root Cause",
      href: `${base}/analysis`,
      icon: <Search className="w-4 h-4" />,
      proOnly: true,
    },
    {
      label: "Ping History",
      href: `${base}/pings`,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: "SSL & Schema",
      href: `${base}/ssl`,
      icon: <Shield className="w-4 h-4" />,
      proOnly: true,
    },
    {
      label: "Settings",
      href: `${base}/settings`,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  function isActive(href: string) {
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  }

  return (
    <TooltipProvider>
      {/* Mobile horizontal tab strip */}
      <div
        className="md:hidden flex gap-1 overflow-x-auto pb-2 px-4 pt-3 border-b border-border"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {navItems.map((item) => {
          const locked = item.proOnly && !isPro;
          const active = isActive(item.href);

          if (locked) {
            return (
              <div
                key={item.href}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap text-neutral-700 cursor-not-allowed opacity-40"
              >
                {item.icon}
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                active
                  ? "bg-[#00ff87]/10 text-[#00ff87]"
                  : "text-neutral-500 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 flex-shrink-0 border-r border-border min-h-[calc(100vh-56px)] pt-4 pb-8 px-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const locked = item.proOnly && !isPro;
            const active = isActive(item.href);

            if (locked) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger className="w-full text-left">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-35">
                      <span className="text-neutral-500">{item.icon}</span>
                      <span
                        className="text-neutral-500 text-xs font-medium flex-1"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {item.label}
                      </span>
                      <Lock className="w-3 h-3 text-neutral-700" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Pro feature</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  active
                    ? "bg-[#00ff87]/10 text-[#00ff87]"
                    : "text-neutral-500 hover:text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={
                    active
                      ? "text-[#00ff87]"
                      : "text-neutral-500 group-hover:text-foreground"
                  }
                >
                  {item.icon}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-[#00ff87]" />
                )}
              </Link>
            );
          })}
        </nav>

        {!isPro && (
          <div className="mt-6 mx-1">
            <div className="relative bg-card border border-[#00ff87]/10 rounded-xl p-3 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/20 to-transparent" />
              <p
                className="text-[10px] text-neutral-400 mb-2 leading-relaxed"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Unlock Root Cause Analysis, Reports, SSL monitoring and more
              </p>
              <Link
                href="/pricing"
                className="text-[10px] text-[#00ff87] font-medium hover:underline"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
