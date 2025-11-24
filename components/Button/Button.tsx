import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "utils/cn"

const button = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-xl",
    "font-medium",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
  ],
  {
    variants: {
      intent: {
        primary: ["bg-primary", "text-primary-foreground", "hover:bg-primary-hover"],
        secondary: ["bg-secondary", "text-secondary-foreground", "hover:bg-secondary-hover"],
        error: ["bg-error", "text-error-foreground"],
      },
      size: {
        sm: ["h-8", "px-3", "text-sm"],
        md: ["h-10", "px-4", "text-base"],
        lg: ["h-12", "px-6", "text-lg"],
      },
      rounded: {
        sm: ["rounded-sm"],
        md: ["rounded-md"],
        lg: ["rounded-lg"],
        full: ["rounded-full"],
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      rounded: "md",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export function Button({ className, intent, size, rounded, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ intent, size, rounded, className }))} {...props}>
      {props.children}
    </button>
  )
}
