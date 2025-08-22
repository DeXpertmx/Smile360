
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smile360 - Sistema de Gestión Dental Integral",
  description: "Plataforma completa de gestión 360° para clínicas dentales modernas. Administra pacientes, citas, tratamientos y más con tecnología de vanguardia.",
  keywords: "gestión dental, clínica dental, software dental, Smile360, odontología, pacientes, citas",
  authors: [{ name: "Smile360", url: "https://smile360.com" }],
  creator: "Smile360",
  publisher: "Smile360",
  robots: "index, follow",
  openGraph: {
    title: "Smile360 - Sistema de Gestión Dental Integral",
    description: "Plataforma completa de gestión 360° para clínicas dentales modernas",
    type: "website",
    locale: "es_ES",
    siteName: "Smile360",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Smile360 - Gestión Dental",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smile360 - Sistema de Gestión Dental Integral",
    description: "Plataforma completa de gestión 360° para clínicas dentales modernas",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#D4AF37",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smile360" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#D4AF37" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="mask-icon" href="/icon.png" color="#D4AF37" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
