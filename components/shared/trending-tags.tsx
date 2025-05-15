import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

const trendingTags = [
  "Blockchain",
  "No-Code",
  "Robotics",
  "Machine Learning",
  "Web3",
  "Mobile",
  "AR/VR",
  "IoT",
  "Data Science",
]

export function TrendingTags() {
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium">Trending Project Tags</h3>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {trendingTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer text-sm hover:bg-secondary/80">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
