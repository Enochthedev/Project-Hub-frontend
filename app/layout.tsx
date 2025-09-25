import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProjectsProvider } from "@/components/providers/projects-provider"
import { AIProvider } from "@/components/providers/ai-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthInitializer } from "@/components/auth/auth-initializer"
import { Toaster } from "@/components/ui/sonner"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { NetworkStatus } from "@/components/pwa/network-status"
import { MockAPIProvider } from "@/components/providers/mock-api-provider"
import { AIAssistantButton } from "@/components/ai/assistant-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Project Hub - Build smarter projects",
  description: "Project ideas, matched to your brain and your semester.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project Hub",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Project Hub",
    "application-name": "Project Hub",
    "msapplication-TileColor": "#1B998B",
    "msapplication-config": "/browserconfig.xml",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1B998B",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <MockAPIProvider>
              <AuthInitializer>
                <ProjectsProvider>
                  <AIProvider>
                    <div className="flex min-h-screen flex-col bg-[#F8F1FF] dark:bg-[#534D56] safe-area-top safe-area-bottom">
                      <Header />
                      <div className="flex-1">{children}</div>
                      <Footer />
                      <AIAssistantButton />
                      <InstallPrompt variant="floating" />
                      <NetworkStatus />
                    </div>
                    <Toaster />
                  </AIProvider>
                </ProjectsProvider>
              </AuthInitializer>
            </MockAPIProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
