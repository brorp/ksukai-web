import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SessionProvider from "@/components/providers/session-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kumpulansoalukai.com"),
  title: {
    default: "KSUKAI | Platform Latihan Soal UKAI, CPNS & PPPK Apoteker No. 1",
    template: "%s | KSUKAI",
  },
  description:
    "Persiapkan diri Anda untuk UKAI, SKB CPNS, dan PPPK Farmasi dengan KSUKAI. Platform simulasi CBT terbaik dengan database soal terupdate dan pembahasan lengkap.",
  keywords: [
    "KSUKAI",
    "UKAI",
    "Ujian Apoteker",
    "Tryout Apoteker",
    "CBT Apoteker",
    "CPNS",
    "PPPK",
    "CPNS Apoteker",
    "PPPK Tenaga Kesehatan",
    "SKB Farmasi",
    "Latihan Soal PPPK Apoteker",
    "kumpulansoalukai.com",
  ],
  authors: [{ name: "KSUKAI Dev Team" }],
  creator: "KSUKAI",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://kumpulansoalukai.com",
    title: "KSUKAI | Platform Latihan Soal UKAI, CPNS & PPPK Apoteker",
    description:
      "Simulasi CBT untuk UKAI dan Seleksi CASN Farmasi. Cek skor dan pembahasan secara instan.",
    siteName: "KSUKAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KSUKAI Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KSUKAI | Kumpulan Soal UKAI & CASN Farmasi Terbaik",
    description: "Simulasi ujian CBT dengan fitur terlengkap.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0085D1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org JSON-LD untuk SEO Organization & Course
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "KSUKAI",
    url: "https://kumpulansoalukai.com",
    logo: "https://kumpulansoalukai.com/Logo-KS-UKAI.png",
    description:
      "Platform persiapan ujian UKAI, CPNS, dan PPPK Apoteker di Indonesia dengan sistem CBT realistik.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
    offers: {
      "@type": "Offer",
      category: "Pharmacy Exam Preparation",
    },
  };

  return (
    <html lang="id" className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${poppins.className} antialiased bg-white text-slate-900`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
