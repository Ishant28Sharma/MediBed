import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-surface-container border border-outline-variant focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/30 rounded-2xl py-4 px-4 text-sm text-on-surface placeholder:text-on-surface-variant transition-all shadow-lg outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
