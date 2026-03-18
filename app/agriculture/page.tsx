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
  { label: "Subsidized Fertilizer Uptake", value: "78%", desc: "% of allocated bags distributed", status: "on-target" as const },
  { label: "Area Under Irrigation", value: "52%", desc: "of target irrigated land", status: "warning" as const },
  { label: "Farmer Registration", value: "6.2M", desc: "registered in e-voucher system", status: "on-target" as const },
  { label: "Program Reach", value: "94%", desc: "counties with active distribution", status: "on-target" as const },
];

const programMetrics = [
  { label: "Subsidized fertilizer (MT)", value: "1.24M" },
  { label: "Subsidized fertilizer (bags)", value: "6.2M" },
  { label: "Area under irrigation (ha)", value: "312K" },
  { label: "Target irrigation (ha)", value: "600K" },
  { label: "Registered farmers", value: "6.2M" },
  { label: "Farmers with e-voucher", value: "5.1M" },
  { label: "Counties in program", value: "44" },
  { label: "Aggregation centres", value: "1,240" },
  { label: "Fertilizer depots", value: "890" },
];

const keyOutcomes = [
  { label: "Maize yield (MT)", value: "3.2M", unit: "MT", reason: "Staple crop production" },
  { label: "Dairy subsidy beneficiaries", value: "420K", unit: "farmers", reason: "Livestock support" },
  { label: "Export earnings (agri)", value: "KES 185B", unit: "FY 2024/25", reason: "Horticulture & tea" },
  { label: "Sector growth", value: "6.2%", unit: "2025/26", reason: "YoY growth target" },
];

const countySample = [
  { name: "Nairobi", fertilizerTons: 12, irrigationHa: 2.1, registeredFarmers: 45, status: "on-target" as const },
  { name: "Nakuru", fertilizerTons: 89, irrigationHa: 18, registeredFarmers: 320, status: "on-target" as const },
  { name: "Uasin Gishu", fertilizerTons: 112, irrigationHa: 22, registeredFarmers: 410, status: "on-target" as const },
  { name: "Trans Nzoia", fertilizerTons: 98, irrigationHa: 15, registeredFarmers: 380, status: "on-target" as const },
  { name: "Kisumu", fertilizerTons: 54, irrigationHa: 8, registeredFarmers: 180, status: "warning" as const },
  { name: "Kakamega", fertilizerTons: 62, irrigationHa: 6, registeredFarmers: 220, status: "warning" as const },
  { name: "Turkana", fertilizerTons: 8, irrigationHa: 1.2, registeredFarmers: 28, status: "intervention" as const },
  { name: "Mandera", fertilizerTons: 5, irrigationHa: 0.8, registeredFarmers: 18, status: "intervention" as const },
  { name: "Kiambu", fertilizerTons: 45, irrigationHa: 12, registeredFarmers: 165, status: "on-target" as const },
  { name: "Meru", fertilizerTons: 71, irrigationHa: 14, registeredFarmers: 290, status: "on-target" as const },
];

const KENYA_GEO_URL = "/geojson/gadm41_KEN_1.json";
const MAP_CENTER: [number, number] = [37.9, -0.2];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.35;

const COUNTY_STYLES: Record<string, { fill: string; stroke: string; fillHover: string }> = {
  "on-target": { fill: "rgba(16, 185, 129, 0.5)", stroke: "rgba(52, 211, 153, 0.7)", fillHover: "rgba(16, 185, 129, 0.75)" },
  warning: { fill: "rgba(245, 158, 11, 0.5)", stroke: "rgba(251, 191, 36, 0.7)", fillHover: "rgba(245, 158, 11, 0.75)" },
  intervention: { fill: "rgba(244, 63, 94, 0.5)", stroke: "rgba(251, 113, 133, 0.7)", fillHover: "rgba(244, 63, 94, 0.75)" },
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
        County metrics
      </h2>
      {data ? (
        <div className="space-y-4 flex-1">
          <p className="text-xl font-bold text-white">{data.name}</p>
          <div
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
              data.status === "on-target"
                ? "bg-emerald-500/20 text-emerald-400"
                : data.status === "warning"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {data.status === "on-target" ? "On target" : data.status === "warning" ? "Warning" : "Intervention needed"}
          </div>
          <dl className="grid grid-cols-1 gap-3">
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Subsidized fertilizer (tons)</dt>
              <dd className="text-lg font-bold text-white">{data.fertilizerTons}</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Area under irrigation (ha)</dt>
              <dd className="text-lg font-bold text-white">{data.irrigationHa}K</dd>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">Registered farmers</dt>
              <dd className="text-lg font-bold text-white">{data.registeredFarmers}K</dd>
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
          <p className="text-sm">Click a county on the map to see fertilizer, irrigation & registration.</p>
          <p className="text-xs mt-2 text-slate-500">
            Green = on target · Yellow = warning · Red = intervention needed
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

export default function AgriculturePage() {
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
              🌾
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Agriculture
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Subsidized fertilizer, irrigation, and farmer registration at a glance. Drill into county performance.
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
              className={`rounded-xl border backdrop-blur-md p-4 ${
                m.status === "on-target"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : m.status === "warning"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-rose-500/30 bg-rose-500/10"
              }`}
            >
              <p className="text-xs font-medium uppercase text-slate-400">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-slate-500">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <MetricBlock title="Subsidized Fertilizer · Irrigation · Farmer Registration" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {programMetrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-1 font-semibold text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </MetricBlock>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <MetricBlock title="Key Outcomes" delay={0.2}>
            <ul className="space-y-3">
              {keyOutcomes.map((o) => (
                <li key={o.label} className="flex justify-between items-start gap-4 rounded-lg bg-white/5 p-3">
                  <div>
                    <p className="font-medium text-white">{o.label}</p>
                    <p className="text-xs text-slate-500">{o.reason}</p>
                  </div>
                  <span className="text-lg font-bold text-white whitespace-nowrap">
                    {o.value} {o.unit}
                  </span>
                </li>
              ))}
            </ul>
          </MetricBlock>
          <MetricBlock title="Program Summary" delay={0.25}>
            <div className="space-y-3 text-slate-300 text-sm">
              <p>
                <strong className="text-white">Subsidized fertilizer:</strong> National program distributes fertilizer at reduced prices via e-voucher; 6.2M bags (1.24M MT) in current season.
              </p>
              <p>
                <strong className="text-white">Area under irrigation:</strong> Target 600K ha; current 312K ha under irrigation. Expansion focused on ASAL and high-potential counties.
              </p>
              <p>
                <strong className="text-white">Farmer registration:</strong> 6.2M farmers registered in the e-voucher system; 5.1M active with redeemed vouchers. Registration enables targeted subsidy and extension.
              </p>
            </div>
          </MetricBlock>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500 space-y-1">
          <p>Kenya Agriculture Command Center · Data indicative · Source: GoK / MoALF</p>
          <p>Fertilizer, irrigation and registration data: National Agriculture Program</p>
        </footer>
      </div>
    </div>
  );
}
