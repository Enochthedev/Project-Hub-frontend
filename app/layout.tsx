import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { MockAPIProvider } from "@/components/providers/mock-api-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Project Hub - University Project Management",
  description: "A comprehensive platform for managing university projects, connecting students and supervisors.",
  keywords: "university, projects, students, supervisors, management, collaboration",
  authors: [{ name: "Project Hub Team" }],
  creator: "Project Hub",
  publisher: "Project Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Project Hub - University Project Management",
    description: "A comprehensive platform for managing university projects, connecting students and supervisors.",
    url: "/",
    siteName: "Project Hub",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "Project Hub Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Hub - University Project Management",
    description: "A comprehensive platform for managing university projects, connecting students and supervisors.",
    images: ["/placeholder-logo.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <MockAPIProvider>
              {children}
              <Toaster />
              <SonnerToaster />
            </MockAPIProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
