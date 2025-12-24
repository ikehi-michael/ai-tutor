"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "glass" | "gradient" | "elevated";
  hover?: boolean;
  glow?: "red" | "blue" | "none";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      glow = "none",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: `
        bg-card
        border border-[rgba(255,255,255,0.06)]
        rounded-2xl
      `,
      glass: `
        bg-[rgba(255,255,255,0.03)]
        backdrop-blur-xl
        border border-[rgba(255,255,255,0.08)]
        rounded-2xl
      `,
      gradient: `
        bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.02)]
        backdrop-blur-xl
        border border-[rgba(255,255,255,0.08)]
        rounded-2xl
      `,
      elevated: `
        bg-card
        border border-[rgba(255,255,255,0.06)]
        rounded-2xl
        shadow-xl shadow-black/20
      `,
    };

    const glowStyles = {
      red: "shadow-[0_0_40px_rgba(220,53,69,0.15)]",
      blue: "shadow-[0_0_40px_rgba(0,123,255,0.15)]",
      none: "",
    };

    const hoverStyles = hover
      ? `
        transition-all duration-300
        hover:border-[rgba(255,255,255,0.15)]
        hover:shadow-xl hover:shadow-black/20
        hover:translate-y-[-2px]
        cursor-pointer
      `
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          glowStyles[glow],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between p-6 pb-0", className)}
      {...props}
    >
      {children || (
        <>
          <div className="space-y-1">
            {title && (
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted">{description}</p>
            )}
          </div>
          {action}
        </>
      )}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// Card Content
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardHeaderProps };
