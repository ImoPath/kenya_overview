import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MSME Economy | Kenya Overview",
  description:
    "MSME overview dashboard for finance access, sector mix, and program support.",
};

export default function MsmeEconomyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

