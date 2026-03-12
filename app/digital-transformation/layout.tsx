import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Transformation | Kenya Government Progress",
  description:
    "Fiber optic network, Wi‑Fi hotspots, public institutions connected, and digital hubs across Kenya.",
};

export default function DigitalTransformationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
