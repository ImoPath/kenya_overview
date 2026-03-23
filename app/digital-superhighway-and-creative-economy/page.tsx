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


type ProjectRow = {
  project_id: number;
  name: string;
  status: string | null;
  percentage_complete: number | null;
  latest_update: string | null;
  allocated_kes: number | null;
  disbursed_kes: number | null;
  county: string | null;
  expected_completion: string | null;
};

type WifiSummary = {
  total: number;
  operational: number;
  not_operational: number;
  counties: number;
  by_county: Array<{ county: string; total: number; operational: number }>;
  by_category: Array<{ category: string; count: number }>;
};

type HubsSummary = {
  total: number;
  complete: number;
  ongoing: number;
  counties: number;
  by_county: Array<{
    county: string;
    percent_complete: number;
    county_status: string;
    total_sites: number;
    sites_complete: number;
    sites_ongoing: number;
  }>;
};

const COUNTY_STYLES: Record<string, { fill: string; stroke: string; fillHover: string }> = {
  "on-target": { fill: "rgba(16, 185, 129, 0.5)", stroke: "rgba(52, 211, 153, 0.7)", fillHover: "rgba(16, 185, 129, 0.75)" },
  warning:     { fill: "rgba(245, 158, 11, 0.5)",  stroke: "rgba(251, 191, 36, 0.7)",  fillHover: "rgba(245, 158, 11, 0.75)" },
  intervention:{ fill: "rgba(244, 63, 94, 0.5)",   stroke: "rgba(251, 113, 133, 0.7)", fillHover: "rgba(244, 63, 94, 0.75)" },
  default:     { fill: "rgba(71, 85, 105, 0.4)",   stroke: "rgba(100, 116, 139, 0.6)", fillHover: "rgba(71, 85, 105, 0.6)" },
};

function getCountyStyle(status: string | undefined) {
  return COUNTY_STYLES[status ?? "default"] ?? COUNTY_STYLES.default;
}

function buildMapData(entries: Array<{ county: string; value: number }>) {
  if (!entries.length) return { statuses: {} as Record<string, string>, ranges: null };
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const n = sorted.length;
  const tercile = Math.max(1, Math.floor(n / 3));
  const statuses: Record<string, string> = {};
  sorted.forEach(({ county }, i) => {
    statuses[county] = i < tercile ? "on-target" : i < 2 * tercile ? "warning" : "intervention";
  });
  return {
    statuses,
    ranges: {
      high:   { min: sorted[tercile - 1].value,                        max: sorted[0].value },
      medium: { min: sorted[Math.min(2 * tercile - 1, n - 1)].value,  max: sorted[tercile].value },
      low:    { min: sorted[n - 1].value,                              max: sorted[Math.min(2 * tercile, n - 1)].value },
    },
  };
}

function CountyMap({
  countyStatuses,
  onCountyHover,
}: {
  countyStatuses: Record<string, string>;
  onCountyHover: (name: string | null) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);

  return (
    <div className="relative w-full h-full min-h-[360px]">
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
                    stroke={colors.stroke}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", fill: colors.fill },
                      hover:   { outline: "none", fill: colors.fillHover, cursor: "pointer" },
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
          aria-label="Reset zoom"
          title="Reset view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "completed" || s === "complete"
      ? "bg-emerald-500/20 text-emerald-400"
      : s === "ongoing"
      ? "bg-cyan-500/20 text-cyan-400"
      : "bg-slate-500/20 text-slate-400";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {status ?? "Unknown"}
    </span>
  );
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

export default function DigitalSuperhighwayCreativeEconomyPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [wifi, setWifi] = useState<WifiSummary | null>(null);
  const [hubs, setHubs] = useState<HubsSummary | null>(null);
  const [mapTab, setMapTab] = useState<"hubs" | "wifi">("hubs");
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("api/projects?focus=digital")
      .then((r) => r.json())
      .then((d: { data: ProjectRow[] }) => setProjects(d.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setProjectsLoading(false));

    fetch("api/wifi")
      .then((r) => r.json())
      .then((d: WifiSummary) => setWifi(d))
      .catch(() => setWifi(null));

    fetch("api/digital-hubs")
      .then((r) => r.json())
      .then((d: HubsSummary) => setHubs(d))
      .catch(() => setHubs(null));
  }, []);

  const hubsMapData = useMemo(() => {
    if (!hubs) return { statuses: {} as Record<string, string>, ranges: null };
    return buildMapData(hubs.by_county.map((r) => ({ county: r.county, value: r.percent_complete })));
  }, [hubs]);

  const wifiMapData = useMemo(() => {
    if (!wifi) return { statuses: {} as Record<string, string>, ranges: null };
    return buildMapData(wifi.by_county.map((r) => ({ county: r.county, value: r.operational })));
  }, [wifi]);

  const { statuses: countyStatuses, ranges: legendRanges } =
    mapTab === "hubs" ? hubsMapData : wifiMapData;

  const hoveredDetail = useMemo(() => {
    if (!hoveredCounty) return null;
    if (mapTab === "hubs" && hubs) {
      const row = hubs.by_county.find(
        (r) => r.county.toLowerCase() === hoveredCounty.toLowerCase()
      );
      return row ? `${row.percent_complete}% complete · ${row.sites_complete}/${row.total_sites} hubs` : null;
    }
    if (mapTab === "wifi" && wifi) {
      const row = wifi.by_county.find(
        (r) => r.county.toLowerCase() === hoveredCounty.toLowerCase()
      );
      return row ? `${row.operational}/${row.total} operational` : null;
    }
    return null;
  }, [hoveredCounty, mapTab, hubs, wifi]);

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
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
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
              📡
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Digital Superhighway and Creative Economy
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Connectivity (fiber, Wi‑Fi, connected institutions) plus indicative creative-economy output and jobs.
              </motion.p>
            </div>
          </div>
        </motion.header>

        {/* KPI cards — all live */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Hubs Complete",    value: hubs  ? hubs.complete.toLocaleString()     : "—", desc: "of " + (hubs ? hubs.total.toLocaleString() : "—") + " total hubs" },
            { label: "Hubs In Progress", value: hubs  ? hubs.ongoing.toLocaleString()      : "—", desc: "across " + (hubs ? hubs.counties : "—") + " counties" },
            { label: "Wi‑Fi Sites",      value: wifi  ? wifi.total.toLocaleString()        : "—", desc: "public hotspots installed" },
            { label: "Wi‑Fi Operational",value: wifi  ? wifi.operational.toLocaleString()  : "—", desc: "of " + (wifi ? wifi.total.toLocaleString() : "—") + " total sites" },
          ].map((m, i) => (
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

        {/* Summary stat rows */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <MetricBlock title="Digital Hubs – Centers of Excellence" delay={0.1}>
            {!hubs && <p className="text-slate-400 text-sm">Loading…</p>}
            {hubs && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Total hubs</p>
                  <p className="mt-1 text-lg font-bold text-white">{hubs.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Complete</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{hubs.complete.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Ongoing</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">{hubs.ongoing.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Counties</p>
                  <p className="mt-1 text-lg font-bold text-white">{hubs.counties}</p>
                </div>
              </div>
            )}
          </MetricBlock>

          <MetricBlock title="Public Wi‑Fi Hotspots" delay={0.12}>
            {!wifi && <p className="text-slate-400 text-sm">Loading…</p>}
            {wifi && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Total sites</p>
                  <p className="mt-1 text-lg font-bold text-white">{wifi.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Operational</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{wifi.operational.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Not operational</p>
                  <p className="mt-1 text-lg font-bold text-amber-400">{wifi.not_operational.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">Counties</p>
                  <p className="mt-1 text-lg font-bold text-white">{wifi.counties}</p>
                </div>
              </div>
            )}
          </MetricBlock>
        </div>

        {/* County map */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md shadow-xl overflow-hidden mb-8"
        >
          {/* Tabs */}
          <div className="flex gap-1 p-2 border-b border-white/10">
            {(["hubs", "wifi"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMapTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mapTab === tab
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab === "hubs" ? "Digital Hubs" : "Wi‑Fi Hotspots"}
              </button>
            ))}
          </div>

          {/* Map canvas */}
          <div
            className="relative min-h-[360px]"
            onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
          >
            <CountyMap countyStatuses={countyStatuses} onCountyHover={setHoveredCounty} />

            {legendRanges && (
              <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-white/20 bg-black/80 backdrop-blur px-3 py-2 space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {mapTab === "hubs" ? "Hub completion %" : "Wi‑Fi operational"}
                </p>
                {[
                  { color: "bg-emerald-500/70", label: `${legendRanges.high.min}${mapTab === "hubs" ? "%" : ""} – ${legendRanges.high.max}${mapTab === "hubs" ? "%" : ""}` },
                  { color: "bg-amber-500/70",   label: `${legendRanges.medium.min}${mapTab === "hubs" ? "%" : ""} – ${legendRanges.medium.max}${mapTab === "hubs" ? "%" : ""}` },
                  { color: "bg-rose-500/70",    label: `${legendRanges.low.min}${mapTab === "hubs" ? "%" : ""} – ${legendRanges.low.max}${mapTab === "hubs" ? "%" : ""}` },
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
        </motion.section>

        {/* Cursor tooltip */}
        {hoveredCounty && (
          <div
            className="fixed rounded-lg border border-white/20 bg-black/80 backdrop-blur px-3 py-2 text-sm font-medium text-white shadow-xl pointer-events-none z-50"
            style={{ left: cursorPos.x + 14, top: cursorPos.y + 14 }}
            role="status"
            aria-live="polite"
          >
            <span>{hoveredCounty}</span>
            {hoveredDetail && (
              <span className="ml-2 text-slate-400 font-normal">· {hoveredDetail}</span>
            )}
          </div>
        )}

        {/* ICT Projects */}
        <div className="mb-6">
          <MetricBlock title="ICT Projects" delay={0.2}>
            {projectsLoading && <p className="text-slate-400">Loading projects…</p>}
            {!projectsLoading && projects.length === 0 && (
              <p className="text-slate-400">No projects found.</p>
            )}
            {!projectsLoading && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.project_id} className="rounded-lg bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-white text-sm leading-snug">{p.name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    {p.percentage_complete != null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{p.percentage_complete}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              (p.status ?? "").toLowerCase() === "completed"
                                ? "bg-emerald-400"
                                : "bg-cyan-400"
                            }`}
                            style={{ width: `${Math.min(100, Number(p.percentage_complete))}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {p.allocated_kes != null && Number(p.allocated_kes) > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Budget: KES {(Number(p.allocated_kes) / 1e9).toFixed(2)}B allocated
                        {p.disbursed_kes != null && Number(p.disbursed_kes) > 0
                          ? ` · ${(Number(p.disbursed_kes) / 1e9).toFixed(2)}B disbursed`
                          : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </MetricBlock>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Digital Superhighway & Creative Economy · All data live from database
        </footer>
      </div>
    </div>
  );
}
