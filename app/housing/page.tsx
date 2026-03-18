"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const overviewMetrics = [
  { label: "Boma Yangu Registrations", value: "8.1M", desc: "Total registered on Boma Yangu", status: "on-target" as const },
  { label: "Completed Units", value: "156K", desc: "Units delivered to date", status: "on-target" as const },
  { label: "Active Construction Sites", value: "247", desc: "Sites under construction", status: "on-target" as const },
  { label: "Jobs Created", value: "412K", desc: "Direct & indirect from housing", status: "on-target" as const },
];

const bomaYanguMetrics = [
  { label: "Total registrations", value: "8.1M" },
  { label: "Active savers", value: "2.4M" },
  { label: "Monthly savings (BYS)", value: "KES 1.8B" },
  { label: "Units allocated", value: "89K" },
  { label: "Pending allocations", value: "312K" },
  { label: "Hustler Fund housing kitty", value: "Active" },
];

const projectMetrics = [
  { label: "Completed units", value: "156,000" },
  { label: "Ongoing units", value: "198,000" },
  { label: "Planned units (pipeline)", value: "250,000" },
  { label: "Affordable (BYP)", value: "312K" },
  { label: "Social housing", value: "48K" },
  { label: "KMRC units", value: "84K" },
];

const constructionSites = [
  { name: "Nairobi (Starehe, Park Road)", units: 1370, status: "ongoing", county: "Nairobi" },
  { name: "Nairobi (Mukuru)", units: 2400, status: "ongoing", county: "Nairobi" },
  { name: "Nakuru (Bondeni)", units: 800, status: "ongoing", county: "Nakuru" },
  { name: "Mombasa (Buxton)", units: 560, status: "ongoing", county: "Mombasa" },
  { name: "Kisumu (Manyatta)", units: 1200, status: "ongoing", county: "Kisumu" },
  { name: "Kiambu (Ruiru)", units: 2000, status: "ongoing", county: "Kiambu" },
  { name: "Eldoret (Huruma)", units: 450, status: "ongoing", county: "Uasin Gishu" },
];

const jobsCreated = [
  { category: "Direct construction", value: "187K" },
  { category: "Materials & supply chain", value: "124K" },
  { category: "Informal / casual", value: "76K" },
  { category: "Professional services", value: "25K" },
  { category: "Total (direct + indirect)", value: "412K" },
];

const countySample = [
  { name: "Nairobi", completedUnits: 42000, ongoingUnits: 38000, sites: 68, jobs: 125000, status: "on-target" as const },
  { name: "Mombasa", completedUnits: 12000, ongoingUnits: 8400, sites: 22, jobs: 38000, status: "on-target" as const },
  { name: "Kisumu", completedUnits: 6800, ongoingUnits: 5200, sites: 14, jobs: 22000, status: "on-target" as const },
  { name: "Nakuru", completedUnits: 9800, ongoingUnits: 7600, sites: 18, jobs: 32000, status: "on-target" as const },
  { name: "Kiambu", completedUnits: 18500, ongoingUnits: 22000, sites: 42, jobs: 68000, status: "on-target" as const },
  { name: "Uasin Gishu", completedUnits: 3200, ongoingUnits: 2800, sites: 8, jobs: 12000, status: "warning" as const },
  { name: "Kakamega", completedUnits: 2100, ongoingUnits: 1800, sites: 5, jobs: 7500, status: "warning" as const },
  { name: "Machakos", completedUnits: 4500, ongoingUnits: 6200, sites: 12, jobs: 18500, status: "on-target" as const },
];

const KENYA_GEO_URL = "/geojson/gadm41_KEN_1.json";
const MAP_CENTER: [number, number] = [37.9, -0.2];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.35;

const COUNTY_STYLES: Record<string, { fill: string; stroke: string; fillHover: string }> = {
  "on-target": { fill: "rgba(16, 185, 129, 0.5)", stroke: "rgba(52, 211, 153, 0.7)", fillHover: "rgba(16, 185, 129, 0.75)" },
  warning: { fill: "rgba(245, 158, 11, 0.5)", stroke: "rgba(251, 191, 36, 0.7)", fillHover: "rgba(245, 158, 11, 0.75)" },
  default: { fill: "rgba(71, 85, 105, 0.4)", stroke: "rgba(100, 116, 139, 0.6)", fillHover: "rgba(71, 85, 105, 0.6)" },
};

function getCountyStyle(status: string | undefined) {
  return COUNTY_STYLES[status ?? "default"] ?? COUNTY_STYLES.default;
}

type CountyMapProps = {
  countyData: typeof countySample;
  onCountyHover: (name: string | null) => void;
  onCountyClick: (name: string) => void;
};

function CountyMap({ countyData, onCountyHover, onCountyClick }: CountyMapProps) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);

  const countyByName = useMemo(() => {
    const map: Record<string, (typeof countySample)[number]> = {};
    countyData.forEach((c) => { map[c.name] = c; });
    return map;
  }, [countyData]);

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const handleReset = () => {
    setZoom(1);
    setCenter(MAP_CENTER);
  };

  return (
    <div className="relative w-full h-full min-h-[320px] lg:min-h-[400px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: MAP_CENTER,
          scale: 2800,
        }}
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
                const data = countyByName[name];
                const status = data?.status;
                const colors = getCountyStyle(status);
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
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/80 backdrop-blur text-white shadow-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/80 backdrop-blur text-white shadow-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button
          type="button"
          onClick={handleReset}
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

function CountyMetricsPanel({
  countyName,
  countyData,
}: {
  countyName: string | null;
  countyData: typeof countySample;
}) {
  const data = countyName ? countyData.find((c) => c.name === countyName) : null;
  const hasNameNoData = countyName && !data;

  return (
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 h-full min-h-[320px] lg:min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        County housing metrics
      </h2>
      {data ? (
        <div className="space-y-4 flex-1">
          <p className="text-xl font-bold text-white">{data.name}</p>
          <div
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
              data.status === "on-target"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {data.status === "on-target" ? "On target" : "Growing"}
          </div>
          <dl className="grid grid-cols-1 gap-3">
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Completed units</dt>
              <dd className="text-lg font-bold text-white">{data.completedUnits.toLocaleString()}</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Ongoing units</dt>
              <dd className="text-lg font-bold text-white">{data.ongoingUnits.toLocaleString()}</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Active sites</dt>
              <dd className="text-lg font-bold text-white">{data.sites}</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Jobs created</dt>
              <dd className="text-lg font-bold text-white">{data.jobs.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      ) : hasNameNoData ? (
        <div className="flex-1 flex flex-col justify-center text-center">
          <p className="text-xl font-bold text-white">{countyName}</p>
          <p className="text-sm text-slate-400 mt-2">No sample data for this county.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center text-center text-slate-400">
          <p className="text-sm">Click a county on the map to see housing metrics.</p>
          <p className="text-xs mt-2 text-slate-500">
            Green = on target · Yellow = growing
          </p>
        </div>
      )}
    </div>
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

export default function HousingPage() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="fixed inset-0 -z-10">
        <Image src="https://res.cloudinary.com/dirib3jmw/image/upload/v1773815336/skyline_nkip6b.jpg" alt="Nairobi skyline" fill className="object-cover" priority sizes="100vw" />
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
          transition={{
            type: "spring",
            stiffness: 85,
            damping: 18,
            mass: 1,
          }}
          className="mb-6 rounded-2xl border border-white/25 bg-black/60 backdrop-blur-xl px-6 py-6 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.08 }}
              className="text-4xl"
            >
              🏠
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Affordable Housing Programme
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Boma Yangu registrations, projects, active construction sites, and jobs created.
              </motion.p>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md overflow-hidden shadow-xl flex items-center justify-center relative">
            <CountyMap
              countyData={countySample}
              onCountyHover={setHoveredCounty}
              onCountyClick={setSelectedCounty}
            />
            {hoveredCounty && (
              <div
                className="absolute bottom-3 left-3 rounded-lg border border-white/20 bg-black/80 backdrop-blur px-3 py-2 text-sm font-medium text-white shadow-xl pointer-events-none z-10"
                role="status"
                aria-live="polite"
              >
                {hoveredCounty}
              </div>
            )}
          </div>
          <CountyMetricsPanel countyName={selectedCounty} countyData={countySample} />
        </motion.section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewMetrics.map((m, i) => (
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

        <MetricBlock title="Boma Yangu Registrations" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bomaYanguMetrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-1 font-semibold text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </MetricBlock>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <MetricBlock title="Projects — Completed & Ongoing Units" delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {projectMetrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
          <MetricBlock title="Jobs Created" delay={0.25}>
            <div className="grid grid-cols-2 gap-4">
              {jobsCreated.map((j, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{j.category}</p>
                  <p className="mt-1 text-xl font-bold text-white">{j.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
        </div>

        <MetricBlock title="Active Construction Sites (sample)" delay={0.3}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20 text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Site</th>
                  <th className="pb-3 pr-4 font-medium">County</th>
                  <th className="pb-3 pr-4 font-medium">Units</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {constructionSites.map((site, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="py-3 pr-4 font-medium">{site.name}</td>
                    <td className="py-3 pr-4">{site.county}</td>
                    <td className="py-3 pr-4">{site.units.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-400">
                        {site.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MetricBlock>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500 space-y-1">
          <p>Kenya Affordable Housing Programme · Data indicative · Source: GoK / SHP</p>
          <p>
            Boma Yangu · KMRC · State Department for Housing and Urban Development
          </p>
        </footer>
      </div>
    </div>
  );
}
