import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agriculture Transformation | Kenya Agriculture Overview",
  description:
    "National agriculture overview: subsidized fertilizer, area under irrigation, farmer registration. County-level program performance.",
};

export default function AgricultureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
