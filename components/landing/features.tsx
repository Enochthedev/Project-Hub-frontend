import { Users, Filter, Sparkles, Code, Database, Zap } from "lucide-react"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { FloatingIcons } from "@/components/ui/floating-icons"

const features = [
  {
    icon: <Filter className="h-10 w-10" />,
    title: "Filter by what matters",
    description: "Find projects that match your discipline, skills, and tools you want to learn.",
    color: "from-[#1B998B] to-[#1B998B]/80",
    bgLight: "bg-[#1B998B]/10",
    textLight: "text-[#1B998B]",
    delay: 0,
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Built by students, for students",
    description: "Every project idea comes from real student experiences and academic needs.",
    color: "from-[#1B998B] to-[#1B998B]/80",
    bgLight: "bg-[#1B998B]/10",
    textLight: "text-[#1B998B]",
    delay: 0.2,
  },
  {
    icon: <Sparkles className="h-10 w-10" />,
    title: "Collaborate with others",
    description: "Find group projects or connect with peers who share your interests.",
    color: "from-[#1B998B] to-[#1B998B]/80",
    bgLight: "bg-[#1B998B]/10",
    textLight: "text-[#1B998B]",
    delay: 0.4,
  },
]

export function LandingFeatures() {
  return (
    <section className="diagonal-box relative py-20">
      {/* Diagonal background */}
      <div className="diagonal-bg-reverse bg-[#F8F1FF] dark:bg-[#534D56]"></div>

      {/* Animated blobs */}
      <AnimatedBlob color="#DECDF5" size="lg" speed="slow" opacity={0.2} className="-right-20 bottom-20 z-0" />

      {/* Floating tech icons */}
      <FloatingIcons count={15} className="opacity-10" />

      <div className="container relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Why Project Hub?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#656176] dark:text-[#DECDF5]">
            We help students find the perfect projects to enhance their learning and build their portfolio.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-hover-effect group relative overflow-hidden rounded-xl border border-[#DECDF5] bg-white/80 p-6 transition-all dark:bg-[#656176]/30 dark:border-[#656176]"
              style={{
                transform: `translateY(${index * 20}px)`,
                transition: "transform 0.5s ease-out, box-shadow 0.3s ease",
                transitionDelay: `${feature.delay}s`,
              }}
            >
              <div
                className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-5`}
              ></div>
              <div
                className={`mb-4 rounded-full ${feature.bgLight} p-3 ${feature.textLight} transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF]">{feature.title}</h3>
              <p className="text-[#656176] dark:text-[#DECDF5]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Animated feature icons */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          <div className="relative h-16 w-16 rounded-full bg-[#1B998B]/10 p-4 animate-float">
            <Code className="h-8 w-8 text-[#1B998B]" />
          </div>
          <div
            className="relative h-16 w-16 rounded-full bg-[#DECDF5] p-4 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <Database className="h-8 w-8 text-[#534D56]" />
          </div>
          <div
            className="relative h-16 w-16 rounded-full bg-[#1B998B]/10 p-4 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <Zap className="h-8 w-8 text-[#1B998B]" />
          </div>
        </div>
      </div>

      {/* Diagonal divider */}
      <div className="diagonal-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-[#DECDF5] dark:fill-[#656176]"></path>
        </svg>
      </div>
    </section>
  )
}
