import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordable Housing | Kenya Affordable Housing",
  description:
    "Affordable Housing overview: Boma Yangu registrations, projects, construction sites, and jobs created.",
};

export default function HousingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

