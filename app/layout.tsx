import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CittClass — Ruang Belajar Digital",
  description: "Platform pembelajaran digital sekolah untuk guru dan siswa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
