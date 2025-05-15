import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingFilters } from "@/components/landing/filters"
import { LandingCTA } from "@/components/landing/cta"
import { AIAssistantButton } from "@/components/ai/assistant-button"

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F1FF] dark:bg-[#534D56]">
      <LandingHero />
      <LandingFeatures />
      <LandingFilters />
      <LandingCTA />
      <AIAssistantButton />
    </main>
  )
}
