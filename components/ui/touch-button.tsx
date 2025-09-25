"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

const touchButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      touchSize: {
        default: "",
        touch: "min-h-[44px] min-w-[44px]", // Apple's recommended minimum touch target
        large: "min-h-[48px] min-w-[48px]", // Google's recommended minimum touch target
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      touchSize: "default",
    },
  }
)

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchButtonVariants> {
  asChild?: boolean
  autoTouchSize?: boolean
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant, size, touchSize, autoTouchSize = true, asChild = false, ...props }, ref) => {
    const { isTouch, isMobile } = useMobile()
    const Comp = asChild ? Slot : "button"
    
    // Automatically apply touch-friendly sizing on touch devices
    const effectiveTouchSize = autoTouchSize && (isTouch || isMobile) 
      ? touchSize || "touch" 
      : touchSize

    return (
      <Comp
        className={cn(touchButtonVariants({ variant, size, touchSize: effectiveTouchSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
TouchButton.displayName = "TouchButton"

export { TouchButton, touchButtonVariants }
