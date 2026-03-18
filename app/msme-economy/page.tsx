"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const overviewMetrics = [
  { label: "Registered MSMEs", value: "5.4M", desc: "Estimated active businesses", status: "on-target" as const },
  { label: "Access to Credit", value: "38%", desc: "MSMEs with formal credit", status: "warning" as const },
  { label: "Avg. Loan Ticket", value: "KES 52K", desc: "SME lending average", status: "on-target" as const },
  { label: "Jobs Supported", value: "1.2M", desc: "Direct + indirect", status: "on-target" as const },
];

const programMetrics = [
  { label: "Hustler Fund accounts", value: "22.8M" },
  { label: "Total disbursed (KES)", value: "KES 56B" },
  { label: "Women/Youth share", value: "61%" },
  { label: "Repayment rate", value: "92%" },
  { label: "Co-ops financed", value: "3,420" },
  { label: "Market digitization pilots", value: "47" },
];

const sectorSplit = [
  { sector: "Trade & retail", share: 34 },
  { sector: "Services", share: 26 },
  { sector: "Agribusiness", share: 18 },
  { sector: "Manufacturing", share: 12 },
  { sector: "Creative & informal", share: 10 },
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

export default function MsmeEconomyPage() {
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
              🏪
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                MSME Economy
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                A high-level view of micro, small and medium enterprises: access to finance, sector mix, and program support.
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
          <MetricBlock title="Program Snapshot" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {programMetrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="mt-1 font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </MetricBlock>

          <MetricBlock title="Sector Mix (dummy)" delay={0.15}>
            <ul className="space-y-3">
              {sectorSplit.map((s) => (
                <li key={s.sector} className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{s.sector}</p>
                    <p className="text-sm text-slate-300">{s.share}%</p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${s.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </MetricBlock>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          MSME Economy Dashboard · Dummy visuals · Source: indicative
        </footer>
      </div>
    </div>
  );
}

