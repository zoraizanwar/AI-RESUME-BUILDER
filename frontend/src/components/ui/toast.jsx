import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

export function Toast({ title, description, variant = "default", onClose }) {
  const variants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
      variants: {
        variant: {
          default: "border bg-background text-foreground",
          destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
          success: "border-success bg-success text-success-foreground",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  )

  return (
    <div className={cn(variants({ variant }))}>
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
