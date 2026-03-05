import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tactone",
  description:
    "Navigate the HSLU Perron Building with ease — your friendly multi-floor navigation assistant.",
  keywords: ["tactone", "navigation", "HSLU", "building", "wayfinding", "Perron"],
  openGraph: {
    title: "Tactone",
    description:
      "Navigate the HSLU Perron Building with ease — your friendly multi-floor navigation assistant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
