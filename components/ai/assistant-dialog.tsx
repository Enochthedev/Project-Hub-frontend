"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EnhancedChatInterface } from "./enhanced-chat-interface"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface AIAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialConversationId?: string
  projectId?: string
}

export function AIAssistantDialog({ 
  open, 
  onOpenChange, 
  initialConversationId,
  projectId 
}: AIAssistantDialogProps) {
  const { isMobile } = useMobile()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden border-[#DECDF5] dark:border-[#656176]",
          isMobile
            ? "w-[calc(100vw-16px)] h-[calc(100vh-80px)] max-w-none rounded-lg"
            : "max-w-6xl h-[80vh]",
        )}
      >
        <EnhancedChatInterface 
          className="h-full"
          initialConversationId={initialConversationId}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  )
}
