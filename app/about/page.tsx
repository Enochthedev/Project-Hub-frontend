import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Lightbulb, Code, BookOpen, Award, Heart } from "lucide-react"

const teamMembers = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    bio: "Former CS professor with a passion for education and technology.",
    image: "/placeholder.svg?height=300&width=300&query=professional person 1",
  },
  {
    name: "Sarah Johnson",
    role: "Head of Product",
    bio: "UX designer turned product leader with 10+ years in edtech.",
    image: "/placeholder.svg?height=300&width=300&query=professional person 2",
  },
  {
    name: "Michael Brown",
    role: "Lead Developer",
    bio: "Full-stack developer who loves building tools for students.",
    image: "/placeholder.svg?height=300&width=300&query=professional person 3",
  },
  {
    name: "Jessica Lee",
    role: "Community Manager",
    bio: "Former student ambassador who's passionate about building communities.",
    image: "/placeholder.svg?height=300&width=300&query=professional person 4",
  },
]

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-[#534D56]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#F8F1FF] dark:bg-[#534D56] -z-10"></div>
        <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2] -z-10"></div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20 px-3 py-1">About Us</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-5xl mb-6">
              Empowering Students Through Project-Based Learning
            </h1>
            <p className="text-lg text-[#656176] dark:text-[#DECDF5] mb-8">
              Project Hub was founded with a simple mission: to help students discover, plan, and build projects that
              enhance their learning and showcase their skills.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href="/explore">
                  Explore Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
              >
                <Link href="/resources/community">Join Our Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white dark:bg-[#534D56]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-6">Our Story</h2>
              <div className="space-y-4 text-[#656176] dark:text-[#DECDF5]">
                <p>
                  Project Hub began in 2023 when our founder, Alex Chen, a computer science professor, noticed that
                  students often struggled to come up with project ideas that were both educational and engaging.
                </p>
                <p>
                  After years of helping students brainstorm project ideas, Alex realized there was a need for a
                  centralized platform where students could discover project ideas tailored to their skills, interests,
                  and academic level.
                </p>
                <p>
                  What started as a simple list of project ideas quickly evolved into a comprehensive platform that now
                  helps thousands of students worldwide find inspiration, learn new skills, and build impressive
                  portfolios.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="#team"
                  className="text-[#1B998B] hover:text-[#1B998B]/80 font-medium inline-flex items-center"
                >
                  Meet our team <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#DECDF5] rounded-full opacity-50 dark:bg-[#656176]"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#1B998B]/20 rounded-full"></div>
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&query=students working on projects"
                  alt="Students working on projects"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-[#F8F1FF] dark:bg-[#656176]/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">Our Mission & Values</h2>
            <p className="text-[#656176] dark:text-[#DECDF5]">
              We're driven by a set of core values that guide everything we do at Project Hub.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Lightbulb className="h-8 w-8" />,
                title: "Innovation",
                description:
                  "We believe in the power of innovative thinking and creative problem-solving to drive learning and growth.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Community",
                description:
                  "We foster a supportive community where students can collaborate, share ideas, and learn from each other.",
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Hands-on Learning",
                description:
                  "We champion practical, project-based learning as the most effective way to develop real-world skills.",
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Accessibility",
                description:
                  "We strive to make quality educational resources accessible to students of all backgrounds and skill levels.",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Excellence",
                description: "We encourage students to pursue excellence in their projects and academic endeavors.",
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Passion",
                description:
                  "We believe that passion is the driving force behind meaningful learning and impactful projects.",
              },
            ].map((value, i) => (
              <Card
                key={i}
                className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/50 transition-all hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="rounded-full bg-[#1B998B]/10 p-3 w-fit mb-4 text-[#1B998B]">{value.icon}</div>
                  <h3 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-2">{value.title}</h3>
                  <p className="text-[#656176] dark:text-[#DECDF5]">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white dark:bg-[#534D56]">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">Meet Our Team</h2>
            <p className="text-[#656176] dark:text-[#DECDF5]">
              We're a passionate group of educators, developers, and designers committed to helping students succeed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <Card
                key={i}
                className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{member.name}</h3>
                  <p className="text-[#1B998B] font-medium">{member.role}</p>
                  <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B998B]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to start your project journey?</h2>
            <p className="text-white/90 mb-8">
              Join thousands of students who are discovering, planning, and building amazing projects with Project Hub.
            </p>
            <Button asChild size="lg" className="bg-white text-[#1B998B] hover:bg-white/90">
              <Link href="/signup">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
