import React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Instrument_Serif } from "next/font/google"

import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
})

export const metadata: Metadata = {
  title: "ChemViz | Chemical Equipment Parameter Visualizer",
  description:
    "Upload, explore, and visualize chemical equipment data. Interactive 3D analytics dashboard with real-time charts and insights.",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
