import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProjectsProvider } from "@/components/providers/projects-provider"
import { AIProvider } from "@/components/providers/ai-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Project Hub - Build smarter projects",
  description: "Project ideas, matched to your brain and your semester.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ProjectsProvider>
            <AIProvider>
              <div className="flex min-h-screen flex-col bg-[#F8F1FF] dark:bg-[#534D56]">
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
            </AIProvider>
          </ProjectsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
