"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { ParticleBackground } from "@/components/ui/particle-background"

const disciplines = [
  "Computer Science",
  "Data Science",
  "Web Development",
  "Mobile Dev",
  "AI/ML",
  "Cybersecurity",
  "Game Development",
  "UI/UX Design",
]

const skills = ["JavaScript", "Python", "React", "Node.js", "SQL", "TensorFlow", "Swift", "Figma", "Unity", "AWS"]

const tools = ["VS Code", "GitHub", "Docker", "Jupyter", "Firebase", "Vercel", "Netlify", "Supabase", "MongoDB Atlas"]

export function LandingFilters() {
  return (
    <section className="diagonal-box relative py-20">
      {/* Diagonal background */}
      <div className="diagonal-bg bg-[#DECDF5] dark:bg-[#656176]"></div>

      {/* Particle background */}
      <ParticleBackground
        particleColor="#534D56"
        particleCount={20}
        speed={0.3}
        className="opacity-10 dark:opacity-20"
      />

      {/* Animated blobs */}
      <AnimatedBlob color="#1B998B" size="md" speed="medium" opacity={0.1} className="left-20 top-40 z-0" />
      <AnimatedBlob color="#DECDF5" size="sm" speed="fast" opacity={0.3} className="right-40 bottom-20 z-0" />

      <div className="container relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Find Your Perfect Project</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#656176] dark:text-[#DECDF5]">
            Browse through our extensive collection of project ideas filtered to match your interests.
          </p>
        </div>

        <Card className="overflow-hidden border border-[#DECDF5] bg-white/90 backdrop-blur dark:bg-[#534D56]/90 dark:border-[#656176]">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">Filter by what matters</CardTitle>
                <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                  Customize your project search
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-[#1B998B]/30 bg-[#1B998B]/10 text-[#1B998B] dark:border-[#1B998B]/50 dark:bg-[#1B998B]/20"
              >
                25+ Categories
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="discipline" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3 bg-[#F8F1FF] dark:bg-[#656176]">
                <TabsTrigger
                  value="discipline"
                  className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white"
                >
                  Discipline
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white">
                  Tools
                </TabsTrigger>
              </TabsList>
              <TabsContent value="discipline" className="mt-0">
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((discipline, index) => (
                    <Badge
                      key={discipline}
                      variant="outline"
                      className="cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        transform: "scale(1)",
                        transition: "transform 0.2s ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      {discipline}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="skills" className="mt-0">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        transform: "scale(1)",
                        transition: "transform 0.2s ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tools" className="mt-0">
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool, index) => (
                    <Badge
                      key={tool}
                      variant="outline"
                      className="cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        transform: "scale(1)",
                        transition: "transform 0.2s ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
