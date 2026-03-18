"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const overviewMetrics = [
  { label: "New Jobs (FY 2025/26)", value: "847K", desc: "Total formal & informal", status: "on-target" as const },
  { label: "Construction / Housing", value: "156K", desc: "Affordable housing & related", status: "on-target" as const },
  { label: "Digital (Jitume & TVETs)", value: "124K", desc: "Trained / placed in digital", status: "on-target" as const },
  { label: "Overseas Employment", value: "42K", desc: "Placements abroad", status: "warning" as const },
];

const keyAreas = [
  {
    id: "construction",
    name: "Construction Jobs (Affordable Housing)",
    icon: "🏗️",
    status: "on-target" as const,
    metrics: [
      { label: "Units delivered / in pipeline", value: "312K" },
      { label: "Direct construction jobs", value: "98K" },
      { label: "Indirect (supply chain)", value: "58K" },
      { label: "Boma Yangu registered", value: "8.1M" },
      { label: "Hustler Fund housing kitty", value: "Active" },
    ],
    description: "Jobs linked to the Affordable Housing Programme: site workers, artisans, engineers, and supply chain roles.",
  },
  {
    id: "digital",
    name: "Digital Jobs (Jitume & TVETs)",
    icon: "💻",
    status: "on-target" as const,
    metrics: [
      { label: "Jitume digital hubs", value: "145" },
      { label: "Youth trained (digital)", value: "124K" },
      { label: "TVETs with digital programs", value: "89" },
      { label: "Remote work placements", value: "31K" },
      { label: "BPO / call center jobs", value: "18K" },
    ],
    description: "Digital skills and employment through Jitume labs, TVET digital curricula, and BPO/remote work.",
  },
  {
    id: "green",
    name: "Green Public Works",
    icon: "🌱",
    status: "on-target" as const,
    metrics: [
      { label: "Kazi Mtaani Phase participants", value: "280K" },
      { label: "Tree planting (million seedlings)", value: "15" },
      { label: "Waste management / cleanup", value: "45K" },
      { label: "Green infrastructure jobs", value: "22K" },
      { label: "Counties with green works", value: "47" },
    ],
    description: "Public works programmes: Kazi Mtaani, afforestation, waste management, and green infrastructure.",
  },
  {
    id: "overseas",
    name: "Overseas Employment",
    icon: "✈️",
    status: "warning" as const,
    metrics: [
      { label: "Placements (FY 2025/26)", value: "42K" },
      { label: "Registered recruitment agencies", value: "312" },
      { label: "Target (annual)", value: "65K" },
      { label: "Top destinations", value: "GCC, EU" },
      { label: "Pre-departure training", value: "Mandatory" },
    ],
    description: "Labour migration: regulated recruitment, bilateral agreements, and pre-departure orientation.",
  },
];

function KeyAreaCard({
  area,
  isSelected,
  onSelect,
}: {
  area: (typeof keyAreas)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full text-left rounded-xl border backdrop-blur-md p-4 transition-all ${
        isSelected
          ? "border-cyan-500/50 bg-cyan-500/15 ring-2 ring-cyan-400/30"
          : "border-white/20 bg-black/50 hover:bg-black/60 hover:border-white/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{area.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{area.name}</p>
          <span
            className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              area.status === "on-target"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {area.status === "on-target" ? "On target" : "Needs attention"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function DetailPanel({
  area,
}: {
  area: (typeof keyAreas)[number] | null;
}) {
  if (!area) {
    return (
      <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 h-full min-h-[320px] lg:min-h-[400px] flex flex-col">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Key area details
        </h2>
        <div className="flex-1 flex flex-col justify-center text-center text-slate-400">
          <p className="text-sm">Select a key area to see metrics and description.</p>
          <p className="text-xs mt-2 text-slate-500">
            Construction · Digital · Green Works · Overseas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 h-full min-h-[320px] lg:min-h-[400px] flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Key area details
      </h2>
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{area.icon}</span>
          <div>
            <p className="text-xl font-bold text-white">{area.name}</p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                area.status === "on-target"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {area.status === "on-target" ? "On target" : "Needs attention"}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-400">{area.description}</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {area.metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-white/5 p-3">
              <dt className="text-xs text-slate-500">{m.label}</dt>
              <dd className="text-lg font-bold text-white">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
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

export default function JobsPage() {
  const [selectedArea, setSelectedArea] = useState<(typeof keyAreas)[number] | null>(null);

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
              💼
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Job Creation Overview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                Construction, digital, green public works, and overseas employment at a glance.
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
          <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md p-5 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Key areas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {keyAreas.map((area) => (
                <KeyAreaCard
                  key={area.id}
                  area={area}
                  isSelected={selectedArea?.id === area.id}
                  onSelect={() => setSelectedArea(area)}
                />
              ))}
            </div>
          </div>
          <DetailPanel area={selectedArea} />
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
          <MetricBlock title="Construction Jobs (Affordable Housing)" delay={0.15}>
            <p className="text-sm text-slate-400 mb-4">
              Jobs linked to the Affordable Housing Programme: site workers, artisans, engineers, and supply chain roles.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {keyAreas[0].metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
          <MetricBlock title="Digital Jobs (Jitume & TVETs)" delay={0.2}>
            <p className="text-sm text-slate-400 mb-4">
              Digital skills and employment through Jitume labs, TVET digital curricula, and BPO/remote work.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {keyAreas[1].metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
          <MetricBlock title="Green Public Works" delay={0.25}>
            <p className="text-sm text-slate-400 mb-4">
              Public works programmes: Kazi Mtaani, afforestation, waste management, and green infrastructure.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {keyAreas[2].metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
          <MetricBlock title="Overseas Employment" delay={0.3}>
            <p className="text-sm text-slate-400 mb-4">
              Labour migration: regulated recruitment, bilateral agreements, and pre-departure orientation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {keyAreas[3].metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500 space-y-1">
          <p>Kenya Job Creation Dashboard · Data indicative · Source: GoK / NEA / TVET / Housing</p>
        </footer>
      </div>
    </div>
  );
}
