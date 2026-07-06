import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Double Slit Experiment",
  description: "Simulation of the double slit experiment using Three.js",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
