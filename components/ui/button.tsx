import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-primary text-black shadow-lg shadow-primary/20 hover:bg-primary-dim': variant === 'primary',
            'bg-surface-low border border-outline-variant text-on-surface hover:bg-surface-container': variant === 'secondary',
            'bg-error/10 text-error hover:bg-error/20': variant === 'danger',
            'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface': variant === 'ghost',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs rounded-lg': size === 'sm',
            'h-12 px-8 text-base rounded-2xl': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
