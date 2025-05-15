import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, ArrowRight, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const tutorials = [
  {
    id: 1,
    title: "Getting Started with Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to build your first web project.",
    image: "/web-development-tutorial.png",
    category: "Web",
    level: "Beginner",
    duration: "2 hours",
    author: "Sarah Johnson",
    date: "May 10, 2025",
  },
  {
    id: 2,
    title: "Building a Full-Stack Application with Next.js",
    description: "Create a complete web application with Next.js, React, and a database of your choice.",
    image: "/placeholder-y4tc7.png",
    category: "Web",
    level: "Intermediate",
    duration: "4 hours",
    author: "Michael Chen",
    date: "April 28, 2025",
  },
  {
    id: 3,
    title: "Introduction to Machine Learning with Python",
    description: "Learn the fundamentals of machine learning using Python and popular libraries.",
    image: "/machine-learning-python.png",
    category: "AI",
    level: "Intermediate",
    duration: "3 hours",
    author: "Emily Rodriguez",
    date: "May 5, 2025",
  },
  {
    id: 4,
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile apps using React Native and JavaScript.",
    image: "/placeholder-nn8ud.png",
    category: "Mobile",
    level: "Intermediate",
    duration: "5 hours",
    author: "David Kim",
    date: "April 15, 2025",
  },
  {
    id: 5,
    title: "Creating a Blockchain Application",
    description: "Learn how to build a simple blockchain application with JavaScript.",
    image: "/placeholder-oapof.png",
    category: "Blockchain",
    level: "Advanced",
    duration: "6 hours",
    author: "Alex Thompson",
    date: "May 2, 2025",
  },
  {
    id: 6,
    title: "Building IoT Projects with Raspberry Pi",
    description: "Create Internet of Things projects using Raspberry Pi and Python.",
    image: "/placeholder-ht51s.png",
    category: "IoT",
    level: "Intermediate",
    duration: "4 hours",
    author: "Jessica Lee",
    date: "April 20, 2025",
  },
]

const categories = ["All", "Web", "Mobile", "AI", "Blockchain", "IoT", "Game Dev"]
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

export default function TutorialsPage() {
  return (
    <main className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">Tutorials</h1>
        <p className="mt-2 text-[#656176] dark:text-[#DECDF5] max-w-3xl">
          Learn new skills and technologies with our comprehensive tutorials. From beginner to advanced, we have
          resources to help you build amazing projects.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center">
          <Filter className="mr-2 h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
          <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Filter by:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className={
                category === "All"
                  ? "bg-[#1B998B] hover:bg-[#1B998B]/90"
                  : "cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50"
              }
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {levels.map((level) => (
            <Badge
              key={level}
              variant="outline"
              className={
                level === "All Levels"
                  ? "bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                  : "cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50"
              }
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <Card
            key={tutorial.id}
            className="overflow-hidden transition-all hover:shadow-md border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30"
          >
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src={tutorial.image || "/placeholder.svg"}
                alt={tutorial.title}
                width={400}
                height={200}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardHeader className="p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-[#1B998B] hover:bg-[#1B998B]/90">{tutorial.category}</Badge>
                <Badge variant="outline" className="border-[#DECDF5] dark:border-[#656176]">
                  {tutorial.level}
                </Badge>
              </div>
              <CardTitle className="text-xl text-[#534D56] dark:text-[#F8F1FF]">{tutorial.title}</CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">{tutorial.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                <Clock className="mr-1 h-4 w-4" />
                <span>{tutorial.duration}</span>
                <span className="mx-2">•</span>
                <BookOpen className="mr-1 h-4 w-4" />
                <span>By {tutorial.author}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-[#DECDF5] dark:border-[#656176]">
              <Button asChild className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href={`/resources/tutorials/${tutorial.id}`}>
                  Start Tutorial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button
          variant="outline"
          className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
        >
          Load More Tutorials
        </Button>
      </div>
    </main>
  )
}
