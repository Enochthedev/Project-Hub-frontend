"use client"

import { useProjects } from "@/components/providers/projects-provider"
import { ProjectCard } from "@/components/shared/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Download, FileText, Search } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { AIAssistantButton } from "@/components/ai/assistant-button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardFooter } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

export default function SavedPage() {
  const { savedProjects, updateProjectNotes } = useProjects()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const { isMobile } = useMobile()

  const filteredProjects = savedProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const exportProjects = () => {
    const dataStr = JSON.stringify(savedProjects, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "project-hub-saved-projects.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const exportAsPDF = () => {
    // In a real app, this would generate a PDF
    alert("PDF export functionality would be implemented here")
  }

  const startEditingNotes = (projectId: string, currentNotes: string) => {
    setEditingNotes(projectId)
    setNoteContent(currentNotes)
  }

  const saveNotes = (projectId: string) => {
    updateProjectNotes(projectId, noteContent)
    setEditingNotes(null)
  }

  return (
    <main className="container py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">
            Saved Projects
          </h1>
          <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">View and manage your saved project ideas.</p>
        </div>

        {!isMobile && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
              onClick={exportAsPDF}
              disabled={savedProjects.length === 0}
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
              onClick={exportProjects}
              disabled={savedProjects.length === 0}
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656176] dark:text-[#DECDF5]" />
        <Input
          placeholder="Search saved projects..."
          className="pl-9 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isMobile && savedProjects.length > 0 && (
        <div className="mb-6 flex gap-2">
          <Button
            variant="outline"
            className="flex flex-1 items-center justify-center gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
            onClick={exportAsPDF}
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="flex flex-1 items-center justify-center gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
            onClick={exportProjects}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {savedProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#DECDF5] dark:border-[#656176] p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-[#656176] dark:text-[#DECDF5]" />
            <h3 className="mt-4 text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No saved projects</h3>
            <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">
              You haven't saved any projects yet. Browse or generate some projects to save them here.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href="/explore">Browse Projects</Link>
              </Button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#DECDF5] dark:border-[#656176] p-8 text-center">
            <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No matching projects</h3>
            <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">
              No saved projects match your search. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden transition-all hover:shadow-md border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30"
              >
                <ProjectCard project={project} />
                <CardFooter className="flex flex-col items-start gap-4 border-t border-[#DECDF5] dark:border-[#656176] bg-[#F8F1FF]/50 p-4 dark:bg-[#656176]/50">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Notes</h4>
                      {editingNotes !== project.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingNotes(project.id, project.notes || "")}
                          className="text-[#534D56] dark:text-[#F8F1FF]"
                        >
                          {project.notes ? "Edit" : "Add"} Notes
                        </Button>
                      )}
                    </div>
                    {editingNotes === project.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          placeholder="Add your notes about this project..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          rows={3}
                          className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNotes(null)}
                            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveNotes(project.id)}
                            className="bg-[#1B998B] hover:bg-[#1B998B]/90"
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-[#656176] dark:text-[#DECDF5]">
                        {project.notes || "No notes added yet."}
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AIAssistantButton />
    </main>
  )
}
