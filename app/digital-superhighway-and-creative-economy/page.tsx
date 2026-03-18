"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const overviewMetrics = [
  { label: "Fiber optic (km)", value: "12,400", desc: "National backbone + last mile", status: "on-target" as const },
  { label: "Public Wi‑Fi hotspots", value: "1,847", desc: "Public access points installed", status: "on-target" as const },
  { label: "Institutions connected", value: "8,200", desc: "Schools, hospitals, gov offices", status: "on-target" as const },
  { label: "Creative jobs enabled", value: "210K", desc: "Digital/creative value chain", status: "warning" as const },
];

const superhighwayMetrics = [
  { label: "National backbone (km)", value: "6,200" },
  { label: "Last-mile fiber (km)", value: "6,200" },
  { label: "Counties with fiber", value: "47" },
  { label: "Submarine cable landings", value: "Mombasa (2)" },
  { label: "NOFBI connected sites", value: "1,024" },
  { label: "Private sector fiber (km)", value: "~18,000" },
];

const creativeEconomy = [
  { segment: "Film & TV", value: "KES 18B", note: "Annual output (dummy)" },
  { segment: "Music & live events", value: "KES 12B", note: "Annual output (dummy)" },
  { segment: "Digital content / creators", value: "KES 9B", note: "Annual output (dummy)" },
  { segment: "Gaming & interactive", value: "KES 4B", note: "Annual output (dummy)" },
  { segment: "Crafts & design", value: "KES 7B", note: "Annual output (dummy)" },
];

const wifiHotspots = [
  { location: "Nairobi CBD", county: "Nairobi", count: 156, type: "Public squares, bus stations" },
  { location: "Mombasa Central", county: "Mombasa", count: 89, type: "Ferry, Likoni, beaches" },
  { location: "Kisumu City", county: "Kisumu", count: 42, type: "Parks, bus park" },
  { location: "Nakuru Town", county: "Nakuru", count: 38, type: "Town square, markets" },
  { location: "Other towns (47 counties)", county: "Various", count: "1,399", type: "County HQs, markets" },
];

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
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <p className="text-xs font-medium uppercase text-slate-400">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-slate-500">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <MetricBlock title="Digital Superhighway (dummy)" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {superhighwayMetrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>

          <MetricBlock title="Creative Economy (dummy)" delay={0.15}>
            <ul className="space-y-3">
              {creativeEconomy.map((row) => (
                <li key={row.segment} className="flex items-start justify-between gap-4 rounded-lg bg-white/5 p-3">
                  <div>
                    <p className="font-medium text-white">{row.segment}</p>
                    <p className="text-xs text-slate-500">{row.note}</p>
                  </div>
                  <p className="text-lg font-bold text-white whitespace-nowrap">{row.value}</p>
                </li>
              ))}
            </ul>
          </MetricBlock>
        </div>

        <MetricBlock title="Public Wi‑Fi Hotspots (sample)" delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Location</th>
                  <th className="pb-2 pr-4 font-medium">County</th>
                  <th className="pb-2 pr-4 font-medium">Hotspots</th>
                  <th className="pb-2 font-medium">Type / area</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {wifiHotspots.map((row) => (
                  <tr key={row.location} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium">{row.location}</td>
                    <td className="py-3 pr-4">{row.county}</td>
                    <td className="py-3 pr-4">{row.count}</td>
                    <td className="py-3 text-slate-400">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MetricBlock>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Digital Superhighway & Creative Economy · Dummy visuals · Source: indicative
        </footer>
      </div>
    </div>
  );
}

