import Link from "next/link";

interface Props {
  isPro: boolean;
  feature: string;
  children: React.ReactNode;
}

export default function ProGate({ isPro, feature, children }: Props) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f8f8]/80 dark:bg-[#080808]/80 rounded-2xl backdrop-blur-sm">
        <p
          className="text-[#080808] dark:text-white text-sm font-semibold mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {feature}
        </p>
        <p
          className="text-neutral-500 text-xs mb-3"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Available on Pro tier
        </p>
        <Link
          href="/pricing"
          className="text-[11px] bg-[#00cc6a] dark:bg-[#00ff87] text-black font-bold px-3 py-1.5 rounded-lg"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
