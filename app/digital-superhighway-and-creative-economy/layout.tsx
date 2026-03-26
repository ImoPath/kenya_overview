import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Superhighway and Creative Economy | Kenya Overview",
  description:
    "Connectivity and creative economy overview dashboard.",
};

export default function DigitalSuperhighwayCreativeEconomyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

