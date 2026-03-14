export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import LocalTime from "../../../../../components/LocalTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

function responseTimeColor(ms: number | null): string {
  if (ms === null) return "text-neutral-600";
  if (ms < 300) return "text-[#00d294]";
  if (ms < 1000) return "text-[#f99c00]";
  return "text-[#fb2c36]";
}

export default async function PingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: monitor } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: pings, count } = await supabase
    .from("pings")
    .select("id, status, status_code, response_time_ms, checked_at, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms", { count: "exact" })
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00d294] mb-1.5 font-medium"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          &gt; ping history
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Ping History
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {count ?? 0} total pings · Page {page} of {totalPages}
        </p>
      </div>

      {!pings || pings.length === 0 ? (
        <div className="relative bg-card border border-border rounded-2xl p-10 text-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
          <p
            className="text-neutral-500 text-xs"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            No pings yet — worker will check this on its next cycle.
          </p>
        </div>
      ) : (
        <>
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Time", "Status", "Status Code", "Response", "DNS", "TCP", "TLS", "TTFB"].map((h) => (
                      <TableHead
                        key={h}
                        className="text-neutral-500 text-[11px] py-3 whitespace-nowrap"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pings.map((ping) => (
                    <TableRow
                      key={ping.id}
                      className="border-border hover:bg-muted/30"
                    >
                      <TableCell
                        className="text-neutral-500 text-xs whitespace-nowrap"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        <LocalTime iso={ping.checked_at} />
                      </TableCell>
                      <TableCell>
                        {ping.status === "up" ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00d294]"
                            style={{ fontFamily: "'Geist Mono', monospace" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00d294]" />
                            UP
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#fb2c36]"
                            style={{ fontFamily: "'Geist Mono', monospace" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fb2c36]" />
                            DOWN
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-neutral-400 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.status_code ?? "—"}
                      </TableCell>
                      <TableCell
                        className={`text-xs font-medium ${responseTimeColor(ping.response_time_ms)}`}
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.response_time_ms != null ? `${ping.response_time_ms}ms` : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.dns_lookup_ms != null ? `${ping.dns_lookup_ms}ms` : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.tcp_connect_ms != null ? `${ping.tcp_connect_ms}ms` : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.tls_handshake_ms != null ? `${ping.tls_handshake_ms}ms` : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {ping.ttfb_ms != null ? `${ping.ttfb_ms}ms` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p
                className="text-[11px] text-neutral-600"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Showing {from + 1}–{Math.min(to + 1, count ?? 0)} of {count ?? 0}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`?page=${page - 1}`}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-border text-neutral-400 hover:text-foreground hover:border-border transition-all"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    ← Prev
                  </Link>
                )}
                <span
                  className="text-[11px] text-neutral-500 px-2"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`?page=${page + 1}`}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-border text-neutral-400 hover:text-foreground hover:border-border transition-all"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
