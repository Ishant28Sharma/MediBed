import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'tertiary' | 'emergency' | 'outline';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
        {
          "bg-surface-container text-on-surface-variant border border-outline-variant": variant === 'default',
          "bg-primary/20 text-primary": variant === 'primary',
          "bg-tertiary/20 text-tertiary": variant === 'tertiary',
          "bg-error/20 text-error animate-pulse": variant === 'emergency',
          "text-on-surface border border-outline-variant": variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {variant !== 'default' && variant !== 'outline' && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          {
            "bg-primary": variant === 'primary',
            "bg-tertiary": variant === 'tertiary',
            "bg-error": variant === 'emergency',
          }
        )} />
      )}
      {props.children}
    </div>
  )
}

export { Badge }
