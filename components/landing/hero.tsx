import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { AnimatedGradient } from "@/components/ui/animated-gradient"
import { AnimatedMascot } from "@/components/ui/animated-mascot"
import { ParticleBackground } from "@/components/ui/particle-background"

export function LandingHero() {
  return (
    <section className="diagonal-box relative overflow-hidden py-20 md:py-32">
      {/* Particle background */}
      <ParticleBackground particleColor="#1B998B" particleCount={30} speed={0.5} className="opacity-20" />

      {/* Diagonal background */}
      <div className="diagonal-bg bg-[#DECDF5] dark:bg-[#656176]"></div>

      {/* Animated blobs */}
      <AnimatedBlob color="#1B998B" size="lg" speed="slow" opacity={0.1} className="-left-20 -top-20 z-0" />
      <AnimatedBlob color="#DECDF5" size="md" speed="medium" opacity={0.2} className="right-10 top-40 z-0" />

      <div className="container relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center rounded-full border border-[#1B998B] bg-[#F8F1FF]/90 px-3 py-1 text-sm font-medium text-[#534D56] backdrop-blur">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-[#1B998B]" />
              <span>Student-powered project discovery</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#534D56] sm:text-5xl md:text-6xl dark:text-[#F8F1FF]">
              Build smarter{" "}
              <AnimatedGradient colors={["#1B998B", "#656176", "#1B998B"]} speed="slow" className="inline-block">
                projects.
              </AnimatedGradient>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[#656176] dark:text-[#DECDF5]">
              Project ideas, matched to your brain and your semester. Discover, learn, and build with confidence.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2 bg-[#1B998B] px-8 hover:bg-[#1B998B]/90">
                <Link href="/explore">
                  Browse Ideas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-[#1B998B] px-8 text-[#1B998B] hover:bg-[#1B998B]/10 dark:text-[#1B998B] dark:border-[#1B998B]"
              >
                <Link href="#ai-assistant">
                  Talk to the AI
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[#1B998B]/10"></div>
            <div className="absolute -right-8 bottom-12 h-24 w-24 rounded-full bg-[#DECDF5]"></div>

            {/* Main illustration */}
            <div className="relative z-10 rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:bg-[#534D56]/80">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#DECDF5] dark:border-[#656176]">
                <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]"></div>

                <AnimatedMascot
                  src="/placeholder-92n51.png"
                  alt="Robot mascot"
                  size="lg"
                  animation="float"
                  delay={2}
                  className="absolute -bottom-8 -right-8"
                />

                <AnimatedMascot
                  src="/coding-cat.png"
                  alt="Coding cat"
                  size="sm"
                  animation="shake"
                  delay={1}
                  className="absolute bottom-10 left-10"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80 p-2">
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center dark:bg-[#534D56]">
                        <span className="text-2xl font-bold text-[#534D56] dark:text-white">PH</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#534D56] dark:text-white">Project Hub</h3>
                      <p className="text-[#656176] dark:text-[#DECDF5]">Discover your next coding adventure</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project cards preview */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#DECDF5] bg-white p-3 shadow-sm dark:bg-[#656176]/50 dark:border-[#656176]"
                  >
                    <div className="h-2 w-16 rounded-full bg-[#DECDF5] animate-pulse-slow dark:bg-[#DECDF5]/50"></div>
                    <div className="mt-3 h-2 w-full rounded-full bg-[#DECDF5] animate-pulse-slow dark:bg-[#DECDF5]/50"></div>
                    <div className="mt-2 h-2 w-3/4 rounded-full bg-[#DECDF5] animate-pulse-slow dark:bg-[#DECDF5]/50"></div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-4 w-12 rounded-full bg-[#1B998B]/20 dark:bg-[#1B998B]/30"></div>
                      <div className="h-4 w-12 rounded-full bg-[#DECDF5] dark:bg-[#DECDF5]/50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal divider */}
      <div className="diagonal-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-[#F8F1FF] dark:fill-[#534D56]"></path>
        </svg>
      </div>
    </section>
  )
}
