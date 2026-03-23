"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const KENYA_GEO_URL = "geojson/gadm41_KEN_1.json";
const MAP_CENTER: [number, number] = [37.9, -0.2];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.35;

type CountyRow = { county: string; count: number };

type CountyDetail = {
  county: string;
  registrations: {
    total: number;
    by_gender: { male: number; female: number };
    by_age: { below_18: number; above_18: number };
    by_employment: { employed: number; self_employed: number; unemployed: number; sponsored: number };
  };
  facilities: {
    total: number;
    active: number;
    inactive: number;
    licensed: number;
    unlicensed: number;
    by_level: Array<{ level: string; count: number }>;
  };
};

type HealthcareSummary = {
  registrations: {
    total: number;
    by_gender: { male: number; female: number };
    by_age: { below_18: number; above_18: number };
    by_employment: {
      employed: number;
      self_employed: number;
      unemployed: number;
      sponsored: number;
    };
    by_county: CountyRow[];
  };
  facilities: {
    total: number;
    active: number;
    inactive: number;
    licensed: number;
    unlicensed: number;
    by_level: Array<{ level: string; count: number }>;
    by_county: CountyRow[];
  };
  last_synced: Array<{ dataset_name: string; last_full_sync_at: string }>;
};

const COUNTY_STYLES: Record<string, { fill: string; stroke: string; fillHover: string }> = {
  "on-target": { fill: "rgba(16, 185, 129, 0.5)", stroke: "rgba(52, 211, 153, 0.7)", fillHover: "rgba(16, 185, 129, 0.75)" },
  warning: { fill: "rgba(245, 158, 11, 0.5)", stroke: "rgba(251, 191, 36, 0.7)", fillHover: "rgba(245, 158, 11, 0.75)" },
  intervention: { fill: "rgba(244, 63, 94, 0.5)", stroke: "rgba(251, 113, 133, 0.7)", fillHover: "rgba(244, 63, 94, 0.75)" },
  default: { fill: "rgba(71, 85, 105, 0.4)", stroke: "rgba(100, 116, 139, 0.6)", fillHover: "rgba(71, 85, 105, 0.6)" },
};

function getCountyStyle(status: string | undefined) {
  return COUNTY_STYLES[status ?? "default"] ?? COUNTY_STYLES.default;
}

function CountyMap({
  countyStatuses,
  onCountyHover,
  onCountyClick,
}: {
  countyStatuses: Record<string, string>;
  onCountyHover: (name: string | null) => void;
  onCountyClick: (name: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);

  return (
    <div className="relative w-full h-full min-h-[320px] lg:min-h-[400px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: MAP_CENTER, scale: 2800 }}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          {...({
            onMoveEnd: ({ coordinates, zoom: z }: { coordinates: [number, number]; zoom: number }) => {
              setCenter(coordinates);
              setZoom(z);
            },
          } as Record<string, unknown>)}
        >
          <Geographies geography={KENYA_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties?.NAME_1 ?? "";
                const colors = getCountyStyle(countyStatuses[name]);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => onCountyHover(name)}
                    onMouseLeave={() => onCountyHover(null)}
                    onClick={() => onCountyClick(name)}
                    stroke={colors.stroke}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", fill: colors.fill },
                      hover: { outline: "none", fill: colors.fillHover, cursor: "pointer" },
                      pressed: { outline: "none", fill: colors.fillHover },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10" role="group" aria-label="Map zoom controls">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/80 backdrop-blur text-white shadow-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/80 backdrop-blur text-white shadow-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button
          type="button"
          onClick={() => { setZoom(1); setCenter(MAP_CENTER); }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/80 backdrop-blur text-white shadow-lg hover:bg-white/10 transition-colors"
          aria-label="Reset zoom and position"
          title="Reset view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
      </div>
    </div>
  );
}

function CountyPanel({
  countyName,
  mapTab,
}: {
  countyName: string | null;
  mapTab: "registrations" | "facilities";
}) {
  const [detail, setDetail] = useState<CountyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!countyName) { setDetail(null); return; }
    setDetailLoading(true);
    setDetail(null);
    fetch(`api/healthcare/county?name=${encodeURIComponent(countyName)}`)
      .then((r) => r.json())
      .then((d: CountyDetail) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [countyName]);

  return (
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 h-full min-h-[320px] lg:min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        County breakdown
      </h2>
      {!countyName && (
        <div className="flex-1 flex flex-col justify-center text-center text-slate-400">
          <p className="text-sm">Click a county on the map to see SHA data.</p>
        </div>
      )}
      {countyName && detailLoading && (
        <p className="text-slate-400 text-sm">Loading {countyName}…</p>
      )}
      {countyName && !detailLoading && detail && (
        <div className="space-y-4 flex-1 overflow-y-auto">
          <p className="text-xl font-bold text-white">{countyName}</p>

          {mapTab === "registrations" && (
            <>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <p className="text-xs text-slate-400">Total registrations</p>
                <p className="text-2xl font-bold text-white">{detail.registrations.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">By gender</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Male</p>
                    <p className="font-semibold text-white">{detail.registrations.by_gender.male.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Female</p>
                    <p className="font-semibold text-white">{detail.registrations.by_gender.female.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">By age</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Below 18</p>
                    <p className="font-semibold text-white">{detail.registrations.by_age.below_18.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">18 and above</p>
                    <p className="font-semibold text-white">{detail.registrations.by_age.above_18.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">By employment</p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["Employed", detail.registrations.by_employment.employed],
                      ["Self employed", detail.registrations.by_employment.self_employed],
                      ["Unemployed", detail.registrations.by_employment.unemployed],
                      ["Sponsored", detail.registrations.by_employment.sponsored],
                    ] as [string, number][]
                  ).map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-semibold text-white">{val.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mapTab === "facilities" && (
            <>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <p className="text-xs text-slate-400">Total facilities</p>
                <p className="text-2xl font-bold text-white">{detail.facilities.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Active / inactive</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Active</p>
                    <p className="font-semibold text-white">{detail.facilities.active.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Inactive</p>
                    <p className="font-semibold text-white">{detail.facilities.inactive.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Licensed / non-licensed</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Licensed</p>
                    <p className="font-semibold text-white">{detail.facilities.licensed.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-slate-500">Non-licensed</p>
                    <p className="font-semibold text-white">{detail.facilities.unlicensed.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {detail.facilities.by_level.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">By KEPH level</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.facilities.by_level.map(({ level, count }) => (
                      <div key={level} className="rounded-lg bg-white/5 px-3 py-2">
                        <p className="text-xs text-slate-500">{level}</p>
                        <p className="font-semibold text-white">{count.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {countyName && !detailLoading && !detail && (
        <p className="text-sm text-slate-400">No SHA data recorded for this county yet.</p>
      )}
    </div>
  );
}

function buildMapData(data: CountyRow[]) {
  if (!data.length) return { statuses: {} as Record<string, string>, ranges: null };
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const n = sorted.length;
  const tercile = Math.max(1, Math.floor(n / 3));
  const statuses: Record<string, string> = {};
  sorted.forEach(({ county }, i) => {
    statuses[county] = i < tercile ? "on-target" : i < 2 * tercile ? "warning" : "intervention";
  });
  return {
    statuses,
    ranges: {
      high:   { min: sorted[tercile - 1].count,                       max: sorted[0].count },
      medium: { min: sorted[Math.min(2 * tercile - 1, n - 1)].count, max: sorted[tercile].count },
      low:    { min: sorted[n - 1].count,                             max: sorted[Math.min(2 * tercile, n - 1)].count },
    },
  };
}

function MetricBlock({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 shadow-xl"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function HealthcarePage() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [summary, setSummary] = useState<HealthcareSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("api/healthcare/summary")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((b: { error?: string; detail?: string }) => {
            throw new Error(b.detail ?? b.error ?? res.statusText);
          });
        }
        return res.json();
      })
      .then((data: HealthcareSummary) => {
        if (!cancelled) setSummary(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const [mapTab, setMapTab] = useState<"registrations" | "facilities">("registrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const regMapData = useMemo(
    () => buildMapData(summary?.registrations.by_county ?? []),
    [summary]
  );
  const facMapData = useMemo(
    () => buildMapData(summary?.facilities.by_county ?? []),
    [summary]
  );

  const { statuses: countyStatuses, ranges: legendRanges } =
    mapTab === "registrations" ? regMapData : facMapData;

  const allCounties = useMemo(() => {
    if (!summary) return [];
    const set = new Set<string>();
    summary.registrations.by_county.forEach((r) => set.add(r.county));
    summary.facilities.by_county.forEach((r) => set.add(r.county));
    return [...set].sort();
  }, [summary]);

  const filteredCounties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCounties;
    return allCounties.filter((c) => c.toLowerCase().includes(q));
  }, [allCounties, searchQuery]);

  const topCards = useMemo(() => {
    if (!summary) return null;
    const syncRow = summary.last_synced.find((s) => s.dataset_name === "registration");
    const syncDate = syncRow
      ? new Date(syncRow.last_full_sync_at).toLocaleDateString("en-KE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
    const licensedPct =
      summary.facilities.total > 0
        ? ((summary.facilities.licensed / summary.facilities.total) * 100).toFixed(1) + "%"
        : "—";
    return [
      {
        label: "SHA Members Registered",
        value: summary.registrations.total.toLocaleString(),
        desc: "Total SHA enrollments",
      },
      {
        label: "Active SHA Facilities",
        value: summary.facilities.active.toLocaleString(),
        desc: `of ${summary.facilities.total.toLocaleString()} total`,
      },
      {
        label: "Licensed Facilities",
        value: licensedPct,
        desc: `${summary.facilities.licensed.toLocaleString()} licensed`,
      },
      {
        label: "Last Data Sync",
        value: syncDate,
        desc: "From SHA systems",
      },
    ];
  }, [summary]);

  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://res.cloudinary.com/dirib3jmw/image/upload/v1773815336/skyline_nkip6b.jpg"
          alt="Nairobi skyline"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" aria-hidden />
      </div>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to dashboard
          </Link>
        </motion.div>

        <motion.header
          initial={{ scale: 0.72, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 85, damping: 18, mass: 1 }}
          className="mb-6 rounded-2xl border border-white/25 bg-black/60 backdrop-blur-xl px-6 py-6 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.08 }}
              className="text-4xl"
            >
              🏥
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Universal Health Care
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                SHA enrollment, facility activation, and coverage across Kenya.
              </motion.p>
            </div>
          </div>
        </motion.header>

        {/* Top 4 KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading && (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-white/20 bg-white/5 p-4 text-slate-400">
              Loading SHA data…
            </div>
          )}
          {!loading && error && (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400">
              Error: {error}
            </div>
          )}
          {!loading && topCards?.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md p-4"
            >
              <p className="text-xs font-medium uppercase text-slate-400">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-slate-500">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* SHA national breakdown — shown first */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <MetricBlock title="SHA Registrations" delay={0.12}>
            {loading && <p className="text-slate-400">Loading…</p>}
            {!loading && summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Male</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.registrations.by_gender.male.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Female</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.registrations.by_gender.female.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Below 18</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.registrations.by_age.below_18.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">18 and above</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.registrations.by_age.above_18.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">By employment type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["Employed", summary.registrations.by_employment.employed],
                        ["Self employed", summary.registrations.by_employment.self_employed],
                        ["Unemployed", summary.registrations.by_employment.unemployed],
                        ["Sponsored", summary.registrations.by_employment.sponsored],
                      ] as [string, number][]
                    ).map(([label, val]) => (
                      <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="font-semibold text-white">{val.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </MetricBlock>

          <MetricBlock title="SHA Facilities" delay={0.14}>
            {loading && <p className="text-slate-400">Loading…</p>}
            {!loading && summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Active</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.facilities.active.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Inactive</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.facilities.inactive.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Licensed</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.facilities.licensed.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Non-licensed</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {summary.facilities.unlicensed.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">By KEPH level</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.facilities.by_level.map(({ level, count }) => (
                      <div key={level} className="rounded-lg bg-white/5 px-3 py-2">
                        <p className="text-xs text-slate-500">{level}</p>
                        <p className="font-semibold text-white">{count.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </MetricBlock>
        </div>

        {/* Map + county panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
            {/* Tabs + county search */}
            <div className="flex items-center gap-1 p-2 border-b border-white/10 shrink-0 flex-wrap">
              {(["registrations", "facilities"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMapTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    mapTab === tab
                      ? "bg-emerald-600 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="relative ml-auto">
                <input
                  type="text"
                  placeholder="Find county…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-emerald-500/50 w-36"
                />
                {searchOpen && filteredCounties.length > 0 && (
                  <div className="absolute top-full mt-1 right-0 w-48 max-h-48 overflow-y-auto rounded-lg border border-white/20 bg-black/90 backdrop-blur z-20 shadow-xl">
                    {filteredCounties.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={() => {
                          setSelectedCounty(c);
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Map */}
            <div
              className="relative flex-1 flex items-center justify-center min-h-[320px] lg:min-h-[380px]"
              onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
            >
              <CountyMap
                countyStatuses={countyStatuses}
                onCountyHover={setHoveredCounty}
                onCountyClick={setSelectedCounty}
              />
              {legendRanges && (
                <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-white/20 bg-black/80 backdrop-blur px-3 py-2 space-y-1.5">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    SHA {mapTab}
                  </p>
                  {[
                    { color: "bg-emerald-500/70", label: `${legendRanges.high.min.toLocaleString()} – ${legendRanges.high.max.toLocaleString()}` },
                    { color: "bg-amber-500/70",   label: `${legendRanges.medium.min.toLocaleString()} – ${legendRanges.medium.max.toLocaleString()}` },
                    { color: "bg-rose-500/70",    label: `${legendRanges.low.min.toLocaleString()} – ${legendRanges.low.max.toLocaleString()}` },
                    { color: "bg-slate-500/50",   label: "No data" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 flex-shrink-0 rounded-sm ${color}`} />
                      <span className="text-xs text-white">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {hoveredCounty && (
            <div
              className="fixed rounded-lg border border-white/20 bg-black/80 backdrop-blur px-3 py-2 text-sm font-medium text-white shadow-xl pointer-events-none z-50"
              style={{ left: cursorPos.x + 14, top: cursorPos.y + 14 }}
              role="status"
              aria-live="polite"
            >
              {hoveredCounty}
            </div>
          )}
          <CountyPanel countyName={selectedCounty} mapTab={mapTab} />
        </motion.section>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Universal Health Care · Data from SHA systems · Last synced:{" "}
          {summary?.last_synced.find((s) => s.dataset_name === "registration")
            ? new Date(
                summary.last_synced.find((s) => s.dataset_name === "registration")!.last_full_sync_at
              ).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
            : "—"}
        </footer>
      </div>
    </div>
  );
}
