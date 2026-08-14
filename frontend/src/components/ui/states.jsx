import * as React from "react"
import { AlertCircle, FileX } from "lucide-react"
import { cn } from "../../lib/utils"

export function EmptyState({ title, description, icon: Icon = FileX, action, className }) {
  return (
    <div className={cn("flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = "Something went wrong", description, action, className }) {
  return (
    <div className={cn("flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
