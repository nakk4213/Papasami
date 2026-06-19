import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Papa Sami Studio | Premium Graphic Design Studio",
    template: "%s | Papa Sami Studio"
  },
  description: "Order premium graphic design, manage projects, message Papa Sami Studio, and track delivery from one polished workspace.",
  applicationName: "Papa Sami Studio",
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  },
  openGraph: {
    title: "Papa Sami Studio",
    description: "Premium graphic design services for brands, churches, campaigns, businesses, and creators.",
    type: "website",
    url: "/",
    siteName: "Papa Sami Studio"
  },
  twitter: {
    card: "summary_large_image",
    title: "Papa Sami Studio",
    description: "Premium graphic design studio."
  }
};

export const viewport: Viewport = {
  themeColor: "#070817",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
