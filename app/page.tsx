"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type PillarCardBase = {
  title: string;
  icon: string;
  details: string[];
  href: string;
};

type MetricCardApi = {
  metric_name: string;
  direction: string;
  percent_value: number | null;
  unit: string | null;
  current_label: string | null;
  current_value: string | null;
  delta_value: string | null;
};

type MetricCardsApiResponse = {
  metrics: MetricCardApi[];
};

type KpiMetric = PillarCardBase & {
  value: string;
  unitLabel: string;
  subtitle: string;
  progress: number;
  trend: string;
  trendUp: boolean;
};

const pillarCards: PillarCardBase[] = [
  {
    title: "Agriculture",
    icon: "🌾",
    details: ["Dairy subsidy & aggregation", "Fertilizer program expanded", "Export earnings up 22%"],
    href: "/agriculture",
  },
  {
    title: "MSME Economy",
    icon: "🏪",
    details: ["Hustler Fund: KES 56B disbursed", "Access to credit improving", "Market digitization pilots"],
    href: "/msme-economy",
  },
  {
    title: "Affordable Housing",
    icon: "🏠",
    details: ["Boma Yangu: 8.1M registered", "156K units completed", "Hustler Fund housing kitty active"],
    href: "/housing",
  },
  {
    title: "Universal Health Care",
    icon: "🏥",
    details: ["Primary care strengthening", "Facility upgrades ongoing", "Coverage expansion efforts"],
    href: "/healthcare",
  },
  {
    title: "Digital Superhighway and Creative Economy",
    icon: "📡",
    details: ["Fiber expansion across counties", "Connected public institutions", "Creative economy enablement"],
    href: "/digital-superhighway-and-creative-economy",
  },
] as const;

function formatMetricValue(metric: MetricCardApi | null): string {
  if (!metric) return "—";
  if (metric.current_value && metric.current_value.trim().length > 0) return metric.current_value;
  if (typeof metric.percent_value === "number" && Number.isFinite(metric.percent_value)) {
    return `${metric.percent_value.toFixed(1)}%`;
  }
  return "—";
}

function formatMetricSubtitle(metric: MetricCardApi | null): string {
  if (!metric) return "Metric pending";
  if (metric.current_label && metric.current_label.trim().length > 0) return metric.current_label;
  return metric.metric_name || "Metric";
}

function formatUnitLabel(metric: MetricCardApi | null, value: string): string {
  if (!metric?.unit) return "";
  const trimmedUnit = metric.unit.trim();
  if (!trimmedUnit) return "";

  // Avoid duplicate unit display when the value already includes it.
  const valueLower = value.toLowerCase();
  const unitLower = trimmedUnit.toLowerCase();
  if (valueLower.includes(unitLower)) return "";
  if (unitLower.includes("percent") || unitLower === "%") {
    return value.includes("%") ? "" : trimmedUnit;
  }
  return trimmedUnit;
}

function formatMetricTrend(metric: MetricCardApi | null): string {
  if (!metric) return "N/A";
  if (metric.delta_value && metric.delta_value.trim().length > 0) return metric.delta_value;
  return "N/A";
}

function metricTrendUp(metric: MetricCardApi | null): boolean {
  if (!metric) return true;
  const dir = (metric.direction || "").toLowerCase();
  return dir !== "down" && dir !== "negative";
}

function metricProgress(metric: MetricCardApi | null): number {
  if (!metric || typeof metric.percent_value !== "number" || !Number.isFinite(metric.percent_value)) return 0;
  return Math.max(0, Math.min(100, metric.percent_value));
}

function KpiCard({
  title,
  icon,
  value,
  unitLabel,
  subtitle,
  progress,
  trend,
  trendUp,
  details,
  href,
}: KpiMetric) {
  const cardContent = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            trendUp ? "bg-emerald-500/30 text-emerald-300" : "bg-rose-500/30 text-rose-300"
          }`}
        >
          {trend} YoY
        </span>
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
        {title.length > 30 ? title.slice(0, 30) + '...' : title}
      </h3>
      <p className="mt-1 flex items-baseline gap-2 text-3xl font-bold text-white">
        <span>{value}</span>
        {unitLabel ? <span className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">{unitLabel}</span> : null}
      </p>
      <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="mt-4 space-y-1 text-xs text-slate-400">
        {details.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {d}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <Link
      href={href}
      className="block rounded-xl outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
    >
      <motion.div
        className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md shadow-xl p-5 cursor-pointer"
        whileHover={{ scale: 1.02, y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {cardContent}
        <p className="mt-3 text-xs text-cyan-400/80 font-medium">
          View details →
        </p>
      </motion.div>
    </Link>
  );
}

type HudumaMdaStat = {
  mdaid: number;
  service_name: string;
  bookings: number;
};

type HudumaStats = {
  success: boolean;
  as_of: string;
  generated_at: string;
  note: string;
  total_huduma_centres: number;
  total_bookings: number;
  total_served: number;
  total_cancelled: number;
  served_percentage: number;
  active_services_offered_nationwide: number;
  top_mdas_by_bookings: HudumaMdaStat[];
};

function HudumaStatsCard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HudumaStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const hudumaApiUrl =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/overview")
            ? "/overview/api/huduma"
            : "/api/huduma";

        const res = await fetch(hudumaApiUrl, { cache: "no-store" });
        const raw = await res.json();

        // The API normalizes upstream into a JS object, but we keep a fallback
        // for older responses that may arrive as a JSON string.
        const parsed =
          typeof raw === "string"
            ? (JSON.parse(raw) as HudumaStats)
            : (raw as HudumaStats);

        if (!alive) return;

        if (parsed?.success) setStats(parsed);
        else {
          setError("HUDUMA stats unavailable right now.");
        }
      } catch {
        if (!alive) return;
        setError("Failed to load HUDUMA stats.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const fmt = useMemo(() => new Intl.NumberFormat("en-KE"), []);

  const servedPct = stats?.served_percentage ?? 0;
  const pctClamped = Math.min(100, Math.max(0, servedPct));
  const pctDeg = pctClamped * 3.6;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left rounded-xl outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Open Huduma Center stats dialog"
      >
        <motion.div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-indigo-950/70 via-slate-950/60 to-black/60 p-5 shadow-2xl"
          whileHover={{
            y: -6,
            boxShadow: "0 24px 70px -22px rgba(0,0,0,0.65)",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
        >
          {/* Decorative streak */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(900px 240px at 0% 0%, rgba(34,211,238,0.35), transparent 60%), radial-gradient(800px 260px at 100% 40%, rgba(251,191,36,0.25), transparent 55%)",
            }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-200/80">
                Huduma Center Stats
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {loading ? "Loading overview..." : stats ? `As of ${stats.as_of}` : "No data"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-300/80">
                    Total Centres
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {loading ? "—" : stats ? fmt.format(stats.total_huduma_centres) : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-300/80">
                    Active Services
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {loading ? "—" : stats ? fmt.format(stats.active_services_offered_nationwide) : "—"}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-300/80">
                    Total Bookings
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {loading ? "—" : stats ? fmt.format(stats.total_bookings) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className="relative h-20 w-20"
                style={{
                  background: `conic-gradient(from 180deg, rgba(34,211,238,0.95) 0deg ${pctDeg}deg, rgba(255,255,255,0.12) ${pctDeg}deg 360deg)`,
                }}
              >
                <div className="absolute inset-2 rounded-full bg-black/60 backdrop-blur-sm" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-bold text-white">
                    {loading ? "—" : stats ? `${pctClamped.toFixed(2)}%` : "—"}
                  </span>
                  <span className="text-[10px] leading-3 text-slate-300/80">
                    served
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-cyan-300/90">
                  Tap for full breakdown →
                </p>
                {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
              </div>
            </div>
          </div>
        </motion.div>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative mx-auto mt-10 w-[92%] max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-xl shadow-2xl max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Huduma Center statistics"
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Huduma Center Stats
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {stats ? (
                    <>
                      <span className="font-medium text-slate-200">
                        As of {stats.as_of}
                      </span>{" "}
                      · Generated {stats.generated_at}
                    </>
                  ) : (
                    "Loading..."
                  )}
                </p>
                {stats ? (
                  <p className="mt-2 text-xs text-slate-400">{stats.note}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  Loading HUDUMA stats...
                </div>
              ) : error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
                  {error}
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase text-slate-300/80">
                        Total bookings
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {fmt.format(stats.total_bookings)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase text-slate-300/80">
                        Total served
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {fmt.format(stats.total_served)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase text-slate-300/80">
                        Cancelled
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {fmt.format(stats.total_cancelled)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase text-slate-300/80">
                        Served rate
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {pctClamped.toFixed(2)}%
                      </p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${pctClamped}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-sm font-bold text-white">
                        Top MDAs by bookings
                      </h3>
                      <p className="text-xs text-slate-300/70">
                        Top 10 services (nationwide)
                      </p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                      <div className="grid grid-cols-[60px_1fr_140px] gap-0 border-b border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-300">
                        <div>#</div>
                        <div>Service</div>
                        <div className="text-right">Bookings</div>
                      </div>

                      <div className="divide-y divide-white/10">
                        {(Array.isArray(stats.top_mdas_by_bookings)
                          ? stats.top_mdas_by_bookings
                          : []
                        ).slice(0, 10).map((m, idx) => (
                          <div
                            key={`${m.mdaid}-${m.service_name}`}
                            className="grid grid-cols-[60px_1fr_140px] items-center px-3 py-2 text-sm text-slate-200"
                          >
                            <div className="text-xs font-semibold text-cyan-200">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {m.service_name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                MDA ID: {m.mdaid}
                              </div>
                            </div>
                            <div className="text-right font-semibold text-white">
                              {fmt.format(m.bookings)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-300/80">
                      Coverage snapshot
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {fmt.format(stats.total_huduma_centres)} HUDUMA centres nationwide ·{" "}
                      {fmt.format(stats.active_services_offered_nationwide)} active services.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function Home() {
  const [metricByPillar, setMetricByPillar] = useState<Record<string, MetricCardApi | null>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      const apiPrefix =
        typeof window !== "undefined" && window.location.pathname.startsWith("/overview")
          ? "/overview"
          : "";

      const entries = await Promise.all(
        pillarCards.map(async (pillar) => {
          try {
            const res = await fetch(
              `${apiPrefix}/api/metric-cards?pillar=${encodeURIComponent(pillar.title)}`,
              { cache: "no-store" }
            );
            if (!res.ok) return [pillar.title, null] as const;
            const data = (await res.json()) as MetricCardsApiResponse;
            const firstMetric = Array.isArray(data.metrics) ? data.metrics[0] ?? null : null;
            return [pillar.title, firstMetric] as const;
          } catch {
            return [pillar.title, null] as const;
          }
        })
      );

      if (!alive) return;
      setMetricByPillar(Object.fromEntries(entries));
    })();

    return () => {
      alive = false;
    };
  }, []);

  const metrics: KpiMetric[] = useMemo(
    () =>
      pillarCards.map((pillar) => {
        const metric = metricByPillar[pillar.title] ?? null;
        return {
          ...pillar,
          value: formatMetricValue(metric),
          unitLabel: formatUnitLabel(metric, formatMetricValue(metric)),
          subtitle: formatMetricSubtitle(metric),
          progress: metricProgress(metric),
          trend: formatMetricTrend(metric),
          trendUp: metricTrendUp(metric),
        };
      }),
    [metricByPillar]
  );

  return (
    <div className="relative min-h-screen overflow-auto">
      {/* Background: skyline image with overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://res.cloudinary.com/dirib3jmw/image/upload/v1773815336/skyline_nkip6b.jpg"
          alt="Nairobi skyline"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85"
          aria-hidden
        />
      </div>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Power BI–style header */}
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Kenya Government Progress 2026
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Strategic pillars · FY 2025/26 · As of Q3
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Live data</span>
          </div>
        </header>

        {/* KPI strip - summary numbers */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div
              key={m.href}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-xs font-medium uppercase text-slate-400">{m.title}</p>
              <p className="mt-0.5 flex items-baseline gap-2 text-xl font-bold text-white">
                <span>{m.value}</span>
                {m.unitLabel ? <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-200/90">{m.unitLabel}</span> : null}
              </p>
            </div>
          ))}
        </div>

        {/* Main dashboard grid - Power BI tile layout */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <KpiCard key={m.href} {...m} />
          ))}
          <HudumaStatsCard />
        </div>

        {/* Footer note */}
        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Kenya National Development Dashboard · Data indicative · Source: Government of Kenya
        </footer>
      </div>
    </div>
  );
}
