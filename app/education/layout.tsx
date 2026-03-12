import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education | Kenya Government Progress",
  description:
    "TVET enrollments, Junior Secondary (JSS), and HELB loans funding.",
};

export default function EducationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
