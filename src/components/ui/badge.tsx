import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Priority variants
        "priority-high":
          "border-transparent bg-priority-high-bg text-priority-high font-medium",
        "priority-medium":
          "border-transparent bg-priority-medium-bg text-priority-medium font-medium",
        "priority-low":
          "border-transparent bg-priority-low-bg text-priority-low font-medium",
        // Category variants
        "category-study":
          "border-transparent bg-category-study-bg text-category-study font-medium",
        "category-event":
          "border-transparent bg-category-event-bg text-category-event font-medium",
        "category-personal":
          "border-transparent bg-category-personal-bg text-category-personal font-medium",
        // Status variants
        success:
          "border-transparent bg-status-success-bg text-status-success font-medium",
        warning:
          "border-transparent bg-status-warning-bg text-status-warning font-medium",
        info:
          "border-transparent bg-status-info-bg text-status-info font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
