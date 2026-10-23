import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border",
    {
        variants: {
            variant: {
                default:
                    "bg-[#0F172A] text-white border-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.14)] hover:bg-[#1E293B] hover:border-[#1E293B] hover:shadow-[0_6px_22px_rgba(15,23,42,0.22)] dark:bg-accent dark:text-[#0F172A] dark:border-accent dark:shadow-[0_4px_20px_rgba(212,175,55,0.2)] dark:hover:bg-[#dfbc48] hover:-translate-y-0.5 active:translate-y-0",
                accent:
                    "bg-accent text-[#0F172A] border-accent shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:bg-[#dfbc48] hover:border-[#dfbc48] hover:shadow-[0_6px_24px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "glass-nav bg-white/80 dark:bg-white/[0.06] border-slate-300/90 dark:border-white/15 text-slate-800 dark:text-slate-100 shadow-sm hover:bg-white dark:hover:bg-white/10 hover:border-accent/60 dark:hover:border-accent/50 hover:-translate-y-0.5 active:translate-y-0",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "border-transparent hover:bg-accent/10 hover:text-accent",
                link: "border-transparent text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 px-4",
                lg: "h-12 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
