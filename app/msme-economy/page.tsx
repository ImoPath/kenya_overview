"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type MetricCard = {
  pillar_code: string;
  pillar_name: string;
  section_id: number;
  section_code: string;
  section_title: string;
  category: string;
  metric_id: number;
  metric_name: string;
  metric_group: string;
  unit: string;
  change_type: string;
  direction: string;
  percent_value: number | null;
  baseline_label: string | null;
  baseline_value: string | null;
  current_label: string | null;
  current_value: string | null;
  delta_label: string | null;
  delta_value: string | null;
  delta_note: string | null;
};

type MetricCardsResponse = {
  pillar: string;
  count: number;
  metrics: MetricCard[];
};

type ProjectRow = {
  project_id: number;
  name: string;
  status: string | null;
  percentage_complete: number | null;
  latest_update: string | null;
  allocated_kes: number | null;
  disbursed_kes: number | null;
  county: string | null;
};

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "completed"
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

function trendTone(direction: string) {
  if (direction === "up") return "border-emerald-500/30 bg-emerald-500/10";
  if (direction === "down") return "border-amber-500/30 bg-amber-500/10";
  return "border-slate-500/30 bg-slate-500/10";
}

export default function MsmeEconomyPage() {
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("api/metric-cards?pillar=MSME Economy")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body: { error?: string; detail?: string }) => {
            throw new Error(body.detail ?? body.error ?? res.statusText);
          });
        }
        return res.json();
      })
      .then((d: MetricCardsResponse) => {
        if (!cancelled) setMetricCards(d.metrics ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setMetricsError(err instanceof Error ? err.message : "Failed to load metrics");
        }
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });

    fetch("api/projects?focus=msme")
      .then((r) => r.json())
      .then((d: { data: ProjectRow[] }) => {
        if (!cancelled) setProjects(d.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const topCards = useMemo(() => metricCards.slice(0, 4), [metricCards]);

  const sectionGroups = useMemo(() => {
    const grouped = new Map<string, MetricCard[]>();
    metricCards.forEach((metric) => {
      const key = `${metric.section_code} ${metric.section_title}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(metric);
    });
    return Array.from(grouped.entries());
  }, [metricCards]);

  const notes = useMemo(
    () =>
      metricCards
        .filter((metric) => Boolean(metric.delta_note))
        .map((metric) => ({
          key: `${metric.section_id}-${metric.metric_id}`,
          label: metric.metric_name,
          note: metric.delta_note as string,
        })),
    [metricCards]
  );

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
                Live MSME indicators sourced from `beta.vw_metric_cards`.
              </motion.p>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricsLoading && (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-white/20 bg-white/5 p-4 text-slate-400">
              Loading MSME metrics…
            </div>
          )}
          {!metricsLoading && metricsError && (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400">
              Error: {metricsError}
            </div>
          )}
          {!metricsLoading &&
            !metricsError &&
            topCards.map((metric, i) => (
              <motion.div
                key={metric.metric_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                className={`rounded-xl border backdrop-blur-md p-4 ${trendTone(metric.direction)}`}
              >
                <p className="text-xs font-medium uppercase text-slate-400">{metric.metric_name}</p>
                <p className="mt-1 text-2xl font-bold text-white">{metric.current_value ?? "—"}</p>
                <p className="text-xs text-slate-500">
                  {metric.current_label ?? "Current"} | {metric.delta_label ?? "Delta"}: {metric.delta_value ?? "—"}
                </p>
              </motion.div>
            ))}
        </div>

        {sectionGroups.map(([sectionTitle, metrics], index) => (
          <MetricBlock key={sectionTitle} title={sectionTitle} delay={0.1 + index * 0.04}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.metric_id} className="rounded-lg bg-white/5 p-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{metric.category}</p>
                  <p className="font-semibold text-white">{metric.metric_name}</p>
                  <p className="text-sm text-slate-300">
                    {metric.baseline_label ?? "Baseline"}: {metric.baseline_value ?? "—"} |{" "}
                    {metric.current_label ?? "Current"}: {metric.current_value ?? "—"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {metric.delta_label ?? "Change"}: {metric.delta_value ?? "—"}
                    {metric.unit ? ` (${metric.unit})` : ""}
                  </p>
                  {metric.percent_value !== null && (
                    <p className="text-xs text-emerald-300">Progress: {metric.percent_value}%</p>
                  )}
                </div>
              ))}
            </div>
          </MetricBlock>
        ))}

        <MetricBlock title="Metric Notes" delay={0.25}>
          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm">No notes available in the data source.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((item) => (
                <li key={item.key} className="rounded-lg bg-white/5 p-3">
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.note}</p>
                </li>
              ))}
            </ul>
          )}
        </MetricBlock>

        <MetricBlock title="MSME & Economy Projects" delay={0.2}>
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
                  {p.latest_update && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{p.latest_update}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </MetricBlock>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          MSME Economy Dashboard · Projects live · Source: `beta.vw_metric_cards`
        </footer>
      </div>
    </div>
  );
}

