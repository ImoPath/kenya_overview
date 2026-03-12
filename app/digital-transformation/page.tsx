"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const overviewMetrics = [
  { label: "Fiber optic (km)", value: "12,400", desc: "National backbone + last mile", status: "on-target" },
  { label: "Wi‑Fi hotspots", value: "1,847", desc: "Public access points installed", status: "on-target" },
  { label: "Institutions connected", value: "8,200", desc: "Schools, hospitals, gov offices", status: "on-target" },
  { label: "Digital hubs", value: "234", desc: "Operational innovation hubs", status: "warning" },
];

const fiberMetrics = [
  { label: "National backbone (km)", value: "6,200" },
  { label: "Last-mile fiber (km)", value: "6,200" },
  { label: "Counties with fiber", value: "47" },
  { label: "Submarine cable landing", value: "Mombasa (2)" },
  { label: "NOFBI connected sites", value: "1,024" },
  { label: "Private sector fiber (km)", value: "~18,000" },
];

const wifiHotspots = [
  { location: "Nairobi CBD", county: "Nairobi", count: 156, type: "Public squares, bus stations" },
  { location: "Mombasa Central", county: "Mombasa", count: 89, type: "Ferry, Likoni, beaches" },
  { location: "Kisumu City", county: "Kisumu", count: 42, type: "Jaramogi Oginga Park, bus park" },
  { location: "Nakuru Town", county: "Nakuru", count: 38, type: "Town square, markets" },
  { location: "Eldoret Town", county: "Uasin Gishu", count: 31, type: "CBD, Moi Stadium" },
  { location: "Thika Town", county: "Kiambu", count: 24, type: "Bus stage, market" },
  { location: "Meru Town", county: "Meru", count: 22, type: "Municipal market, bus park" },
  { location: "Nyeri Town", county: "Nyeri", count: 19, type: "Town centre" },
  { location: "Garissa Town", county: "Garissa", count: 15, type: "Municipal, university" },
  { location: "Lamu Old Town", county: "Lamu", count: 12, type: "Heritage area, port" },
  { location: "Other towns (47 counties)", county: "Various", count: "1,399", type: "County HQs, markets" },
];

const institutionsConnected = [
  { category: "Primary schools", count: "3,200", progress: 42 },
  { category: "Secondary schools", count: "1,840", progress: 68 },
  { category: "TVET institutions", count: "238", progress: 95 },
  { category: "Universities (public)", count: "42", progress: 100 },
  { category: "Hospitals / health facilities", count: "1,120", progress: 58 },
  { category: "Government offices", count: "1,760", progress: 78 },
];

const digitalHubs = [
  { name: "Konza Technopolis", county: "Machakos", status: "operational", focus: "Tech city, BPO, data centers" },
  { name: "Nairobi Garage / iHub", county: "Nairobi", status: "operational", focus: "Startups, incubation" },
  { name: "Mombasa GoDown Arts", county: "Mombasa", status: "operational", focus: "Creative, digital skills" },
  { name: "Kisumu Innovation Hub", county: "Kisumu", status: "operational", focus: "Agri-tech, youth" },
  { name: "Nakuru Rift Valley Innovation", county: "Nakuru", status: "operational", focus: "Agri, manufacturing" },
  { name: "County innovation hubs (47)", county: "All counties", status: "operational", focus: "County-level digital access" },
  { name: "Jitume digital labs", county: "Nationwide", status: "operational", focus: "Youth skills, freelancing" },
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

export default function DigitalTransformationPage() {
  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="fixed inset-0 -z-10">
        <Image src="/skyline.jpg" alt="" fill className="object-cover" priority sizes="100vw" />
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
              📡
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Digital Transformation
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Fiber, public Wi‑Fi, connected institutions, and digital hubs across Kenya.
              </motion.p>
            </div>
          </div>
        </motion.header>

        {/* Top 4 metrics */}
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

        <MetricBlock title="Fiber Optic Network" delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {fiberMetrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-1 font-semibold text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </MetricBlock>

        <MetricBlock title="Wi‑Fi Hotspots Installed (Locations)" delay={0.15}>
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

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <MetricBlock title="Public Institutions Connected" delay={0.2}>
            <ul className="space-y-3">
              {institutionsConnected.map((c) => (
                <li key={c.category} className="flex justify-between items-center gap-4 rounded-lg bg-white/5 p-3">
                  <div>
                    <p className="font-medium text-white">{c.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">{c.count}</span>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-white/10 overflow-hidden ml-auto">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </MetricBlock>
          <MetricBlock title="Digital Hubs Operational" delay={0.25}>
            <ul className="space-y-3">
              {digitalHubs.map((h) => (
                <li key={h.name} className="rounded-lg bg-white/5 p-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-white">{h.name}</p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{h.county}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{h.focus}</p>
                </li>
              ))}
            </ul>
          </MetricBlock>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Kenya Digital Transformation · Data indicative · Source: GoK / ICT Authority / NOFBI
        </footer>
      </div>
    </div>
  );
}
