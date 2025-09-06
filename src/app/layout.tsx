import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Double Slit Experiment",
  description: "Simulation of the double slit experiment using Three.js",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  },
  openGraph: {
    title: "Double Slit Experiment",
    description: "Simulation of the double slit experiment using Three.js",
    images: [
      {
        url: 'https://double-slit.vercel.app/img/banner.png',
        width: 1200,
        height: 630,
        alt: 'Double Slit Experiment - Interactive 3D simulation',
      },
    ],
    type: 'website',
    url: 'https://double-slit.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Double Slit Experiment",
    description: "Simulation of the double slit experiment using Three.js",
    images: ['https://double-slit.vercel.app/img/banner.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
