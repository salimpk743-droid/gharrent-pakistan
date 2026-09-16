import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40",
  {
    variants: {
      variant: {
        default: "bg-forest text-white hover:bg-forest-2",
        outline: "border border-line bg-white text-ink hover:bg-sand",
        ghost: "text-forest hover:bg-sand",
        white: "bg-white text-forest hover:bg-lime",
        lime: "bg-lime text-ink hover:bg-lime/80",
        destructive: "bg-danger text-white hover:bg-danger/90",
        link: "text-forest underline-offset-4 hover:underline px-0 min-h-0",
      },
      size: {
        default: "min-h-11 px-4",
        sm: "min-h-9 px-3 text-xs",
        lg: "min-h-12 px-5 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
