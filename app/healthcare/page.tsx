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

/** Map county row: name + status for coloring (derived from population data) */
type CountyMapRow = { name: string; status: string };

const KENYA_GEO_URL = "/geojson/gadm41_KEN_1.json";
const MAP_CENTER: [number, number] = [37.9, -0.2];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.35;

/** Kenya population data from DHA API (kenya-population-data) */
export type KenyaPopulationRow = {
  updated_county: string;
  updated_gender: string;
  age_status: string;
  population_count: number;
  year: string;
};

/** Registration data from DHA API (registration-data) */
export type RegistrationRow = {
  name: string;
  creation: string;
  age_status: string;
  updated_gender: string;
  updated_employment_type: string;
  updated_county: string;
  last_modified_date: string;
};

/** SHA uptake data from DHA API (sha-uptake-data) */
export type ShaUptakeRow = {
  frCode: string;
  transacting_facility: string;
  Licensed_Status: string;
  Active_Status: string;
  facilityName: string;
  address_county: string;
  facilityAgent: string;
  kephLevel: string;
  last_modified_date: string;
};

/** Fallback when API is non-200 or returns no data — sample Kenya population by county/gender/age */
const FALLBACK_POPULATION_DATA: KenyaPopulationRow[] = (() => {
  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Kakamega",
    "Kisii", "Meru", "Uasin Gishu", "Turkana", "Mandera", "Machakos",
  ];
  const genders = ["Male", "Female"];
  const ageGroups = ["0-17", "18-59", "60+"];
  const year = "2019";
  const rows: KenyaPopulationRow[] = [];
  const basePops: Record<string, number> = {
    Nairobi: 4_400_000, Mombasa: 1_200_000, Kisumu: 1_150_000, Nakuru: 2_160_000,
    Kiambu: 2_420_000, Kakamega: 1_870_000, Kisii: 1_270_000, Meru: 1_550_000,
    "Uasin Gishu": 1_130_000, Turkana: 927_000, Mandera: 868_000, Machakos: 1_420_000,
  };
  counties.forEach((county) => {
    const total = basePops[county] ?? 1_000_000;
    genders.forEach((gender, gi) => {
      ageGroups.forEach((age, ai) => {
        const share = (1 / 6) * (0.9 + (gi * 0.05) + (ai * 0.05));
        rows.push({
          updated_county: county,
          updated_gender: gender,
          age_status: age,
          population_count: Math.round(total * share),
          year,
        });
      });
    });
  });
  return rows;
})();

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
  countyData: CountyMapRow[];
  onCountyHover: (name: string | null) => void;
  onCountyClick: (name: string) => void;
};

function CountyMap({ countyData, onCountyHover, onCountyClick }: CountyMapProps) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);

  const countyByName = useMemo(() => {
    const map: Record<string, CountyMapRow> = {};
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
  populationData,
}: {
  countyName: string | null;
  populationData: KenyaPopulationRow[] | null;
}) {
  const countyRows = useMemo(() => {
    if (!countyName || !populationData?.length) return null;
    return populationData.filter((r) => (r.updated_county || "").trim() === countyName.trim());
  }, [countyName, populationData]);

  const stats = useMemo(() => {
    if (!countyRows?.length) return null;
    const total = countyRows.reduce((s, r) => s + (r.population_count ?? 0), 0);
    const byGender = countyRows.reduce<Record<string, number>>((acc, r) => {
      const g = r.updated_gender || "Unknown";
      acc[g] = (acc[g] ?? 0) + (r.population_count ?? 0);
      return acc;
    }, {});
    const byAge = countyRows.reduce<Record<string, number>>((acc, r) => {
      const a = r.age_status || "Unknown";
      acc[a] = (acc[a] ?? 0) + (r.population_count ?? 0);
      return acc;
    }, {});
    return { total, byGender, byAge };
  }, [countyRows]);

  return (
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 h-full min-h-[320px] lg:min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        County population
      </h2>
      {countyName && stats ? (
        <div className="space-y-4 flex-1">
          <p className="text-xl font-bold text-white">{countyName}</p>
          <dl className="rounded-lg bg-white/5 p-3">
            <dt className="text-xs text-slate-500">Total population</dt>
            <dd className="text-lg font-bold text-white mt-1">{stats.total.toLocaleString()}</dd>
          </dl>
          {Object.keys(stats.byGender).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">By gender</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byGender).map(([g, n]) => (
                  <span key={g} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white">
                    {g}: {n.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          )}
          {Object.keys(stats.byAge).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">By age group</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byAge).map(([a, n]) => (
                  <span key={a} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white">
                    {a}: {n.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : countyName ? (
        <div className="flex-1 flex flex-col justify-center text-center">
          <p className="text-xl font-bold text-white">{countyName}</p>
          <p className="text-sm text-slate-400 mt-2">No population data for this county.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center text-center text-slate-400">
          <p className="text-sm">Click a county on the map to see population by gender and age.</p>
          <p className="text-xs mt-2 text-slate-500">
            Green = higher population · Yellow = medium · Red = lower population
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

function normalizePopulationData(
  raw: unknown
): KenyaPopulationRow[] {
  if (Array.isArray(raw)) return raw as KenyaPopulationRow[];
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: KenyaPopulationRow[] }).data;
  }
  return [];
}

export default function HealthcarePage() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  const [populationData, setPopulationData] = useState<KenyaPopulationRow[] | null>(null);
  const [populationLoading, setPopulationLoading] = useState(true);
  const [populationError, setPopulationError] = useState<string | null>(null);

  const [registrationData, setRegistrationData] = useState<RegistrationRow[] | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"dateRange" | "lastModified">("dateRange");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastModifiedDate, setLastModifiedDate] = useState("");

  const [shaUptakeData, setShaUptakeData] = useState<ShaUptakeRow[] | null>(null);
  const [shaUptakeLoading, setShaUptakeLoading] = useState(false);
  const [shaUptakeError, setShaUptakeError] = useState<string | null>(null);
  const [shaUptakeLastModified, setShaUptakeLastModified] = useState("");

  function apiErrorFromResponse(b: { error?: string; detail?: string }, fallback: string): string {
    if (b.detail) return b.error ? `${b.error}: ${b.detail}` : b.detail;
    return b.error ?? fallback;
  }

  function fetchRegistration() {
    const params = new URLSearchParams();
    if (filterMode === "dateRange") {
      if (!startDate || !endDate) {
        setRegistrationError("Please set both start and end date.");
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setRegistrationError("End date cannot be before start date.");
        return;
      }
      const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000);
      if (days > 92) {
        setRegistrationError("Date range cannot exceed 3 months (92 days).");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(startDate) > today || new Date(endDate) > today) {
        setRegistrationError("Start and end dates cannot be in the future. Use a date range up to today.");
        return;
      }
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    } else {
      const trimmed = lastModifiedDate.trim();
      if (!trimmed) {
        setRegistrationError("Please enter a last modified date (ISO 8601 UTC).");
        return;
      }
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) {
        setRegistrationError("Invalid date/time. Use ISO 8601 (e.g. 2026-03-12T10:30:32Z).");
        return;
      }
      params.set("last_modified_date", d.toISOString());
    }
    setRegistrationError(null);
    setRegistrationLoading(true);
    fetch(`/api/healthcare/registration-data?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((b: { error?: string; detail?: string }) => {
            throw new Error(apiErrorFromResponse(b, res.statusText));
          });
        }
        return res.json();
      })
      .then((raw: unknown) => {
        const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) ? (raw as { data: RegistrationRow[] }).data : [];
        setRegistrationData(list);
      })
      .catch((err: unknown) => {
        setRegistrationError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        setRegistrationLoading(false);
      });
  }

  function fetchShaUptake() {
    const trimmed = shaUptakeLastModified.trim();
    if (trimmed) {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) {
        setShaUptakeError("Invalid date/time. Use ISO 8601 UTC (e.g. 2026-03-12T09:01:32Z).");
        return;
      }
    }
    setShaUptakeError(null);
    setShaUptakeLoading(true);
    const params = new URLSearchParams();
    if (trimmed) params.set("last_modified_date", new Date(trimmed).toISOString());
    fetch(`/api/healthcare/sha-uptake-data${params.toString() ? `?${params.toString()}` : ""}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((b: { error?: string; detail?: string }) => {
            throw new Error(apiErrorFromResponse(b, res.statusText));
          });
        }
        return res.json();
      })
      .then((raw: unknown) => {
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)
            ? (raw as { data: ShaUptakeRow[] }).data
            : [];
        setShaUptakeData(list);
      })
      .catch((err: unknown) => {
        setShaUptakeError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        setShaUptakeLoading(false);
      });
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/healthcare/population-data")
      .then((res) => {
        if (!res.ok) return res.json().then((b: { error?: string; detail?: string }) => { throw new Error(apiErrorFromResponse(b, res.statusText)); });
        return res.json();
      })
      .then((raw) => {
        if (cancelled) return;
        setPopulationData(normalizePopulationData(raw));
      })
      .catch((err) => {
        if (!cancelled) setPopulationError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setPopulationLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const effectivePopulationData = useMemo(
    () => (populationData?.length ? populationData : FALLBACK_POPULATION_DATA),
    [populationData]
  );
  const isUsingFallback = !populationData?.length;

  const countyMapData = useMemo((): CountyMapRow[] => {
    if (!effectivePopulationData.length) return [];
    const byCounty = effectivePopulationData.reduce<Record<string, number>>((acc, r) => {
      const c = (r.updated_county || "").trim();
      if (!c) return acc;
      acc[c] = (acc[c] ?? 0) + (r.population_count ?? 0);
      return acc;
    }, {});
    const entries = Object.entries(byCounty)
      .map(([name, pop]) => ({ name, pop }))
      .sort((a, b) => b.pop - a.pop);
    if (entries.length === 0) return [];
    const terciles = Math.max(1, Math.floor(entries.length / 3));
    return entries.map(({ name }, i) => {
      let status: string;
      if (i < terciles) status = "on-target";
      else if (i < 2 * terciles) status = "warning";
      else status = "intervention";
      return { name, status };
    });
  }, [effectivePopulationData]);

  const topMetrics = useMemo(() => {
    if (!effectivePopulationData.length) return null;
    const total = effectivePopulationData.reduce((s, r) => s + (r.population_count ?? 0), 0);
    const counties = new Set(effectivePopulationData.map((r) => (r.updated_county || "").trim()).filter(Boolean)).size;
    const years = [...new Set(effectivePopulationData.map((r) => r.year).filter(Boolean))].sort().join(", ") || "—";
    const byGender = effectivePopulationData.reduce<Record<string, number>>((acc, r) => {
      const g = r.updated_gender || "Unknown";
      acc[g] = (acc[g] ?? 0) + (r.population_count ?? 0);
      return acc;
    }, {});
    const female = byGender["Female"] ?? 0;
    const femalePct = total > 0 ? ((female / total) * 100).toFixed(1) : "—";
    return [
      { label: "Total population", value: total.toLocaleString(), desc: "Census dataset total", status: "on-target" as const },
      { label: "Counties", value: String(counties), desc: "Counties in dataset", status: "on-target" as const },
      { label: "Census year(s)", value: years, desc: "Reference period", status: "on-target" as const },
      { label: "Female share", value: `${femalePct}%`, desc: "Of total population", status: "on-target" as const },
    ];
  }, [effectivePopulationData]);

  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="fixed inset-0 -z-10">
        <Image src="https://res.cloudinary.com/dirib3jmw/image/upload/v1773815336/skyline_nkip6b.jpg" alt="Nairobi skyline" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" aria-hidden />
      </div>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
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

        {/* Hero title */}
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
              🏥
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                State of the Health System
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Get a 30-second understanding of the health system and drill into problems immediately.
              </motion.p>
            </div>
          </div>
        </motion.header>

        {/* County map + county population panel — from population data */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md overflow-hidden shadow-xl flex items-center justify-center relative">
            <CountyMap
              countyData={countyMapData}
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
          <CountyMetricsPanel countyName={selectedCounty} populationData={effectivePopulationData} />
        </motion.section>

        {/* Top 4 metrics — from population data (fallback used when API fails or returns empty) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {populationLoading && (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-white/20 bg-white/5 p-4 text-slate-400">
              Loading population metrics…
            </div>
          )}
          {!populationLoading && topMetrics?.map((m, i) => (
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
          {!populationLoading && isUsingFallback && (
            <p className="col-span-2 lg:col-span-4 text-xs text-amber-400/90">
              Showing sample data — API unavailable or returned no data.
            </p>
          )}
        </div>

        {/* Kenya Population Data from protected DHA API (fallback when non-200 or empty) */}
        <MetricBlock title="Kenya Population Data (DHA)" delay={0.12}>
          {populationLoading && (
            <p className="text-slate-400">Loading population data…</p>
          )}
          {!populationLoading && populationError && (
            <p className="text-amber-400 mb-3">Error: {populationError}</p>
          )}
          {!populationLoading && (
            <div className="space-y-4">
              {isUsingFallback && (
                <p className="text-sm text-amber-400/90">
                  Showing sample data — API unavailable or returned no data.
                </p>
              )}
              {(() => {
                const data = effectivePopulationData;
                if (!data.length) return <p className="text-slate-400">No population data.</p>;
                const total = data.reduce((s, r) => s + (r.population_count ?? 0), 0);
                const years = [...new Set(data.map((r) => r.year))].filter(Boolean).sort();
                const byGender = data.reduce<Record<string, number>>((acc, r) => {
                  const g = r.updated_gender || "Unknown";
                  acc[g] = (acc[g] ?? 0) + (r.population_count ?? 0);
                  return acc;
                }, {});
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Total population (dataset)</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {total.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Census year(s)</p>
                        <p className="mt-1 font-semibold text-white">
                          {years.length ? years.join(", ") : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Records</p>
                        <p className="mt-1 font-semibold text-white">
                          {data.length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {Object.keys(byGender).length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">By gender</p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(byGender).map(([gender, count]) => (
                            <span
                              key={gender}
                              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white"
                            >
                              {gender}: {count.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </MetricBlock>

        {/* Registration Data (DHA) with filters */}
        <MetricBlock title="Registration Data (DHA)" delay={0.14}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-slate-400">Filter by:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="regFilter"
                    checked={filterMode === "dateRange"}
                    onChange={() => { setFilterMode("dateRange"); setRegistrationError(null); }}
                    className="rounded border-slate-500 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-white">Date range</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="regFilter"
                    checked={filterMode === "lastModified"}
                    onChange={() => { setFilterMode("lastModified"); setRegistrationError(null); }}
                    className="rounded border-slate-500 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-white">Last modified (incremental)</span>
                </label>
              </div>
            </div>
            {filterMode === "dateRange" && (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Start date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">End date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500 self-center">Max 3 months span</p>
              </div>
            )}
            {filterMode === "lastModified" && (
              <div className="flex flex-wrap gap-4 items-end">
                <div className="min-w-[220px]">
                  <label className="block text-xs text-slate-500 mb-1">Last modified (ISO 8601 UTC)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-03-12T10:30:32Z"
                    value={lastModifiedDate}
                    onChange={(e) => setLastModifiedDate(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchRegistration}
                disabled={registrationLoading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {registrationLoading ? "Loading…" : "Fetch registration data"}
              </button>
            </div>
            {registrationError && (
              <p className="text-amber-400 text-sm">{registrationError}</p>
            )}
            {!registrationLoading && !registrationError && registrationData !== null && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">
                  {registrationData.length} record{registrationData.length !== 1 ? "s" : ""} returned
                </p>
                {registrationData.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 bg-black/80 text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">County</th>
                          <th className="px-3 py-2 font-medium">Gender</th>
                          <th className="px-3 py-2 font-medium">Age</th>
                          <th className="px-3 py-2 font-medium">Employment</th>
                          <th className="px-3 py-2 font-medium">Creation</th>
                          <th className="px-3 py-2 font-medium">Last modified</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        {registrationData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-3 py-2">{row.name ?? "—"}</td>
                            <td className="px-3 py-2">{row.updated_county ?? "—"}</td>
                            <td className="px-3 py-2">{row.updated_gender ?? "—"}</td>
                            <td className="px-3 py-2">{row.age_status ?? "—"}</td>
                            <td className="px-3 py-2">{row.updated_employment_type ?? "—"}</td>
                            <td className="px-3 py-2">{row.creation ?? "—"}</td>
                            <td className="px-3 py-2">{row.last_modified_date ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400">No records for the selected filters.</p>
                )}
              </div>
            )}
          </div>
        </MetricBlock>

        {/* SHA Uptake Data (DHA) — all data or incremental by last_modified_date */}
        <MetricBlock title="SHA Uptake Data (DHA)" delay={0.145}>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Fetch all facility uptake data, or use last modified date (ISO 8601 UTC) for incremental sync.
            </p>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[260px]">
                <label className="block text-xs text-slate-500 mb-1">
                  Last modified (optional — leave empty for all data)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-03-12T09:01:32Z"
                  value={shaUptakeLastModified}
                  onChange={(e) => { setShaUptakeLastModified(e.target.value); setShaUptakeError(null); }}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchShaUptake}
                disabled={shaUptakeLoading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {shaUptakeLoading ? "Loading…" : "Fetch SHA uptake data"}
              </button>
            </div>
            {shaUptakeError && (
              <p className="text-amber-400 text-sm">{shaUptakeError}</p>
            )}
            {!shaUptakeLoading && !shaUptakeError && shaUptakeData !== null && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">
                  {shaUptakeData.length} record{shaUptakeData.length !== 1 ? "s" : ""} returned
                </p>
                {shaUptakeData.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 bg-black/80 text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="px-3 py-2 font-medium">Facility code</th>
                          <th className="px-3 py-2 font-medium">Facility name</th>
                          <th className="px-3 py-2 font-medium">County</th>
                          <th className="px-3 py-2 font-medium">KEPH level</th>
                          <th className="px-3 py-2 font-medium">Licensed</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Transaction</th>
                          <th className="px-3 py-2 font-medium">Agent</th>
                          <th className="px-3 py-2 font-medium">Last modified</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        {shaUptakeData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-3 py-2">{row.frCode ?? "—"}</td>
                            <td className="px-3 py-2">{row.facilityName ?? "—"}</td>
                            <td className="px-3 py-2">{row.address_county ?? "—"}</td>
                            <td className="px-3 py-2">{row.kephLevel ?? "—"}</td>
                            <td className="px-3 py-2">{row.Licensed_Status ?? "—"}</td>
                            <td className="px-3 py-2">{row.Active_Status ?? "—"}</td>
                            <td className="px-3 py-2">{row.transacting_facility ?? "—"}</td>
                            <td className="px-3 py-2">{row.facilityAgent ?? "—"}</td>
                            <td className="px-3 py-2">{row.last_modified_date ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400">No records returned.</p>
                )}
              </div>
            )}
          </div>
        </MetricBlock>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500 space-y-1">
          <p>Kenya Health Command Center · Data indicative · Source: GoK / SHA</p>
          <p>
            Data source:{" "}
            <a
              href="https://cr.dha.go.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
            >
              Kenya Client Registry (DHA)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
