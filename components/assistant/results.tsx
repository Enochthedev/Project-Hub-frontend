"use client"

import { useProjects } from "@/components/providers/projects-provider"
import { ProjectCard } from "@/components/shared/project-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Sparkles, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"

export function AIAssistantResults() {
  const { generatedProjects, isGenerating } = useProjects()
  const [copied, setCopied] = useState(false)

  if (isGenerating) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center py-12">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#1B998B]/20"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#1B998B]"></div>
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[#1B998B]" />
        </div>
        <p className="mt-4 text-center text-[#656176] dark:text-[#DECDF5]">
          Our AI is crafting personalized project ideas just for you...
        </p>
      </div>
    )
  }

  if (generatedProjects.length === 0) {
    return null
  }

  const handleShare = () => {
    const projectsText = generatedProjects
      .map(
        (project) =>
          `${project.title}\n${project.description}\nDifficulty: ${project.difficulty}\nTags: ${project.tags.join(
            ", ",
          )}\n\n`,
      )
      .join("")

    navigator.clipboard.writeText(projectsText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="mt-12 space-y-8">
      <Alert className="border-[#1B998B]/20 bg-[#1B998B]/5 text-[#1B998B] dark:border-[#1B998B]/30 dark:bg-[#1B998B]/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>AI-Generated Results</AlertTitle>
        <AlertDescription className="text-[#534D56] dark:text-[#DECDF5]">
          Here are some project ideas based on your profile. You can save any idea to revisit later.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
          onClick={() => window.print()}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>
      </div>

      <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
        {generatedProjects.map((project) => (
          <motion.div key={project.id} variants={item}>
            <ProjectCard project={project} showSaveButton />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
