import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { AnimatedMascot } from "@/components/ui/animated-mascot"
import { AnimatedGradient } from "@/components/ui/animated-gradient"

export function LandingCTA() {
  return (
    <section className="diagonal-box relative py-20">
      {/* Diagonal background */}
      <div className="diagonal-bg-reverse bg-[#F8F1FF] dark:bg-[#534D56]"></div>

      <div className="container relative z-10">
        <div className="rounded-xl bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80 p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 opacity-20">
            <Sparkles className="h-32 w-32 text-white" />
          </div>

          <div className="absolute -bottom-5 right-10">
            <AnimatedMascot src="/coding-cat.png" alt="Coding cat" size="md" animation="float" className="opacity-80" />
          </div>

          <div className="mx-auto max-w-3xl text-center text-white">
            <AnimatedGradient
              colors={["rgba(255,255,255,1)", "rgba(222,205,245,1)", "rgba(255,255,255,1)"]}
              speed="medium"
              className="inline-block"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to find your next project?</h2>
            </AnimatedGradient>
            <p className="mt-4 text-lg">Get personalized project recommendations based on your skills and interests.</p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#1B998B] hover:bg-white/90 transition-transform duration-300 hover:scale-105"
              >
                <Link href="/assistant" className="gap-2">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
