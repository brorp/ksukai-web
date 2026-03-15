import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google"; // Ganti ke Poppins
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

// Inisialisasi Poppins dengan weight yang sering kita pakai (bold & black)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins", // CSS variable untuk digunakan di Tailwind
});

export const metadata: Metadata = {
  title: "CBT - Platform Ujian Apoteker Profesional",
  description:
    "Platform ujian online CBT untuk apoteker dengan simulasi 200 soal, kalkulator saintifik, dan referensi nilai laboratorium normal.",
  keywords: "CBT, ujian Apoteker, CBT Apoteker, simulasi UKOM, Apoteker",
  generator: "CBT Dev Team",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body
        className={`${poppins.className} antialiased bg-white text-slate-900`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
