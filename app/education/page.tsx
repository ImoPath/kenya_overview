"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const overviewMetrics = [
  { label: "TVET Enrollments", value: "342K", desc: "FY 2025/26 technical trainees", status: "on-target" },
  { label: "JSS Enrollments", value: "1.24M", desc: "Junior secondary learners", status: "on-target" },
  { label: "HELB Loans Disbursed", value: "KES 52B", desc: "University & TVET funding", status: "warning" },
  { label: "Beneficiaries (HELB)", value: "298K", desc: "Students funded this FY", status: "on-target" },
];

const tvetEnrollments = [
  { program: "Engineering & Built Environment", count: "98,200", growth: "+12%" },
  { program: "Business & Hospitality", count: "76,400", growth: "+8%" },
  { program: "ICT & Digital", count: "54,800", growth: "+22%" },
  { program: "Agriculture & Natural Resources", count: "42,100", growth: "+5%" },
  { program: "Health & Social Services", count: "38,600", growth: "+15%" },
  { program: "Creative & Applied Arts", count: "21,400", growth: "+18%" },
  { program: "Other trades", count: "10,500", growth: "+3%" },
];

const jssEnrollments = [
  { grade: "Grade 7", count: "1,240,000", cohort: "2025" },
  { grade: "Grade 8", count: "1,185,000", cohort: "2024" },
  { grade: "Grade 9", count: "1,092,000", cohort: "2023" },
];

const helbFunding = [
  { category: "University loans disbursed (KES)", value: "38.4B", beneficiaries: "212K" },
  { category: "TVET / TVET-U fund (KES)", value: "8.2B", beneficiaries: "64K" },
  { category: "Constituency bursary (GoK)", value: "5.4B", beneficiaries: "~420K" },
  { category: "Total HELB funding (FY 2025/26)", value: "52B", beneficiaries: "298K" },
  { category: "Loan recovery (FY)", value: "12.8B", note: "Repayments" },
  { category: "Default rate", value: "18%", note: "Under improvement" },
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

export default function EducationPage() {
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
              📚
            </motion.span>
            <div>
              <motion.h1
                initial={{ scale: 0.88, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Education
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-1 text-slate-400"
              >
                TVET enrollments, Junior Secondary (JSS), and HELB loans funding.
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

        <MetricBlock title="TVET Enrollments" delay={0.1}>
          <div className="space-y-3">
            {tvetEnrollments.map((row) => (
              <div key={row.program} className="flex justify-between items-center rounded-lg bg-white/5 p-3">
                <div>
                  <p className="font-medium text-white">{row.program}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{row.count}</span>
                  <span className="ml-2 text-xs text-emerald-400">{row.growth}</span>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 mt-4">
              <p className="text-sm font-semibold text-cyan-300">
                Total TVET enrollments: 342K
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Across 238 TVET institutions nationwide</p>
            </div>
          </div>
        </MetricBlock>

        <MetricBlock title="JSS Enrollments" delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {jssEnrollments.map((row) => (
              <div key={row.grade} className="rounded-lg bg-white/5 p-4">
                <p className="text-xs text-slate-500">{row.grade} ({row.cohort})</p>
                <p className="text-xl font-bold text-white mt-1">{row.count}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-white/5 p-4">
            <p className="text-xs text-slate-500">Total JSS (Grades 7–9)</p>
            <p className="text-2xl font-bold text-white mt-1">3.52M</p>
            <p className="text-xs text-slate-400 mt-1">Transition rate Primary → JSS: 98.2% · Classrooms built: 18,600</p>
          </div>
        </MetricBlock>

        <MetricBlock title="HELB Loans Funding" delay={0.2}>
          <ul className="space-y-3">
            {helbFunding.map((row) => (
              <li key={row.category} className="flex justify-between items-start gap-4 rounded-lg bg-white/5 p-3">
                <div>
                  <p className="font-medium text-white">{row.category}</p>
                  {"beneficiaries" in row && (
                    <p className="text-xs text-slate-500 mt-0.5">{row.beneficiaries} beneficiaries</p>
                  )}
                  {"note" in row && (
                    <p className="text-xs text-slate-500 mt-0.5">{row.note}</p>
                  )}
                </div>
                <span className="text-lg font-bold text-white whitespace-nowrap">{row.value}</span>
              </li>
            ))}
          </ul>
        </MetricBlock>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Kenya Education Dashboard · Data indicative · Source: GoK / MoE / TVET / HELB
        </footer>
      </div>
    </div>
  );
}
