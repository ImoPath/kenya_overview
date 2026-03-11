import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "State of the Health System | Kenya Health Command Center",
  description:
    "National health overview: SHA performance, coverage, facilities, outcomes, workforce. Drill into problems in 30 seconds.",
};

export default function HealthcareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
