"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const metrics = [
  {
    title: "Universal Healthcare",
    icon: "🏥",
    value: "78%",
    subtitle: "Kenyans with NHIF coverage",
    progress: 78,
    trend: "+12%",
    trendUp: true,
    details: ["4.2M new enrolments", "47 counties with improved facilities", "UHC pilot in 10 counties"],
    href: "/healthcare",
  },
  {
    title: "Affordable Housing",
    icon: "🏠",
    value: "312K",
    subtitle: "Units delivered / in pipeline",
    progress: 62,
    trend: "+18%",
    trendUp: true,
    details: ["Boma Yangu: 8.1M registered", "156K units completed", "Hustler Fund housing kitty active"],
    href: "/housing",
  },
  {
    title: "Agriculture Transformation",
    icon: "🌾",
    value: "6.2%",
    subtitle: "Sector growth (2025/26)",
    progress: 72,
    trend: "+4.1%",
    trendUp: true,
    details: ["Dairy subsidy & aggregation", "Fertilizer program expanded", "Export earnings up 22%"],
    href: "/agriculture",
  },
  {
    title: "Job Creation",
    icon: "💼",
    value: "847K",
    subtitle: "New jobs (FY 2025/26)",
    progress: 85,
    trend: "+9%",
    trendUp: true,
    details: ["Construction/Housing: 156K", "Digital (Jitume/TVET): 124K", "Green works & overseas: 64K"],
    href: "/jobs",
  },
  {
    title: "Digital Transformation",
    icon: "📡",
    value: "94%",
    subtitle: "4G population coverage",
    progress: 94,
    trend: "+7%",
    trendUp: true,
    details: ["e-Citizen services: 15K+", "Digital ID rollout", "Fiber to 47 counties"],
    href: "/digital-transformation",
  },
  {
    title: "Education",
    icon: "📚",
    value: "342K",
    subtitle: "TVET enrollments (FY 2025/26)",
    progress: 88,
    trend: "+12%",
    trendUp: true,
    details: ["JSS: 1.24M Grade 7", "HELB loans: KES 52B", "298K students funded"],
    href: "/education",
  },
];

function KpiCard({
  title,
  icon,
  value,
  subtitle,
  progress,
  trend,
  trendUp,
  details,
  href,
}: (typeof metrics)[0]) {
  const cardContent = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            trendUp ? "bg-emerald-500/30 text-emerald-300" : "bg-rose-500/30 text-rose-300"
          }`}
        >
          {trend} YoY
        </span>
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
        {title}
      </h3>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="mt-4 space-y-1 text-xs text-slate-400">
        {details.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {d}
          </li>
        ))}
      </ul>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl">
        <motion.div
          className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md shadow-xl p-5 cursor-pointer"
          whileHover={{ scale: 1.02, y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {cardContent}
          <p className="mt-3 text-xs text-cyan-400/80 font-medium">
            {href === "/healthcare"
              ? "View health system →"
              : href === "/housing"
                ? "View housing →"
                : href === "/agriculture"
                  ? "View agriculture →"
                  : href === "/jobs"
                    ? "View job creation →"
                    : href === "/digital-transformation"
                      ? "View digital transformation →"
                      : href === "/education"
                        ? "View education →"
                        : "View details →"}
          </p>
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-md shadow-xl transition hover:bg-black/60">
      <div className="p-5">{cardContent}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-auto">
      {/* Background: skyline image with overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://res.cloudinary.com/dirib3jmw/image/upload/v1773815336/skyline_nkip6b.jpg"
          alt="Nairobi skyline"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85"
          aria-hidden
        />
      </div>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Power BI–style header */}
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Kenya Government Progress 2026
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Strategic pillars · FY 2025/26 · As of Q3
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Live data</span>
          </div>
        </header>

        {/* KPI strip - summary numbers */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-xs font-medium uppercase text-slate-400">{m.title}</p>
              <p className="mt-0.5 text-xl font-bold text-white">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Main dashboard grid - Power BI tile layout */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, i) => (
            <KpiCard key={i} {...m} />
          ))}
        </div>

        {/* Footer note */}
        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Kenya National Development Dashboard · Data indicative · Source: Government of Kenya
        </footer>
      </div>
    </div>
  );
}
